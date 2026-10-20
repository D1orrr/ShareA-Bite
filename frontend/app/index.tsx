import React from "react";
import { Redirect } from "expo-router";

/** First screen: the welcome / sign-up page. */
export default function RootIndex() {
  return <Redirect href="/welcome" />;
}
