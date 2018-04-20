import React, { Component } from "react";
import Head from "next/head";
import ip from "ip"; /* IP util for node */
import firebase from "../modules/firebase";
import CurrentlyViewing from "../components/CurrentlyViewing";
import css from "../assets/style/style.css";

export default class extends React.Component {
  state = {};
  /* https://github.com/zeit/next.js/#fetching-data-and-component-lifecycle */
  /* access server-side for node functionality and req object to resolve IP address */
  static async getInitialProps({ req }) {
    return {
      ip:
        /* https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-Forwarded-For */
        (req.headers["x-forwarded-for"] || "")
          .split(",") /* multiple entries possible, proxies */
          .shift() /* origin remote IP address */ ||
        ip.address("public") /* localhost IP address  */
    };
  }
  async componentDidMount() {
    const { ip } = this.props;

    // on change to viewers, re-render viewers list
    const onChange = data => {
      console.log("oncahnge data:", data);
      this.setState({ viewers: data, isLoading: false });
    };
    const sessionToken = firebase({ ip, onChange });

    // rerender viewer list
    this.setState({
      viewers: [{ ip, isViewer: true, sessionToken }],
      isLoading: true
    });
  }
  render() {
    const { isLoading, viewers } = this.state;
    console.log("render viewers:", viewers);
    return (
      <div className={css.body}>
        <Head>
          <title>Qulinary - Currently Viewing</title>
          <meta name="viewport" content="width=device-width, initial-scale=1" />
        </Head>
        <CurrentlyViewing viewers={viewers} isLoading={isLoading} />
      </div>
    );
  }
}
