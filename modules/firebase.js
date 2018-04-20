import * as firebase from "firebase";
import hat from "hat";

/* credentials hardcoded for demo, with no auth for public read/write.
 In production, api keys should be placed in .env variables and injected during runtime.
*/
const firebaseConfig = {
  apiKey: "AIzaSyAnutkEB8dWgh3sqWGZQZmf67rnrtu5ZKk",
  authDomain: "qulinary-currently-viewing.firebaseapp.com",
  databaseURL: "https://qulinary-currently-viewing.firebaseio.com",
  storageBucket: "qulinary-currently-viewing.appspot.com"
};

// initialize firebase once
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

export default ({ ip, onChange }) => {
  // get firebase db instance
  const firedb = firebase.database();

  // firebase doesn't allow "." as a key, use hyphen instead
  const urlFriendlyKey = ip.split(".").join("-");
  // get ref to this viewer
  const thisViewerRef = firedb.ref(`viewers/${urlFriendlyKey}`);
  /* update this viewer's IP to firebase */
  const newPostRef = thisViewerRef.push();
  const sessionToken = hat();
  newPostRef.set({ ip, sessionToken });
  // thisViewerRef.set({ ip, sessionToken: hat() });
  /* on disconnect, remove from firebase */

  thisViewerRef.on("child_added", function(data) {
    console.log("on child added:", data);
    // addCommentElement(postElement, data.key, data.val().text, data.val().author);
  });

  newPostRef.onDisconnect().remove();
  // thisViewerRef.onDisconnect().remove();

  firedb.ref("viewers").on("value", snapshot => {
    const hashOfIPs = snapshot.val();
    console.log("hashOfIPs:", hashOfIPs);
    const arrayData = [];
    Object.keys(hashOfIPs).forEach(key => {
      return Object.keys(hashOfIPs[key]).forEach(innerKey => {
        console.log("innerKey:", innerKey);
        arrayData.push({
          ip: key.replace(/-/g, "."),
          isViewer: hashOfIPs[key][innerKey].sessionToken === sessionToken,
          sessionToken: hashOfIPs[key][innerKey].sessionToken
        });
      });
    });
    console.log("on arrayData:", arrayData);
    onChange(arrayData);
  });

  return sessionToken;
};
