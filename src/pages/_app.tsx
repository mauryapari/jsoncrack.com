import React from "react";
import type { AppProps } from "next/app";
import dynamic from "next/dynamic";
import Head from "next/head";
import { useRouter } from "next/router";
import { MantineProvider, createTheme } from "@mantine/core";
import "@mantine/core/styles.css";
import "@mantine/code-highlight/styles.css";
import { ThemeProvider } from "styled-components";
import { SessionContextProvider, Session } from "@supabase/auth-helpers-react";
import ReactGA from "react-ga4";
import GlobalStyle from "src/constants/globalStyle";
import { lightTheme } from "src/constants/theme";
import { supabase } from "src/lib/api/supabase";
import useUser from "src/store/useUser";

const mantineTheme = createTheme({
  primaryShade: 8,
});

const isDevelopment = process.env.NODE_ENV === "development";
const GA_TRACKING_ID = process.env.NEXT_PUBLIC_GA_ID;

ReactGA.initialize(GA_TRACKING_ID, { testMode: isDevelopment });

const Toaster = dynamic(() => import("react-hot-toast").then(c => c.Toaster));
const ExternalMode = dynamic(() => import("src/layout/ExternalMode"));
const ModalController = dynamic(() => import("src/layout/ModalController"));

function JsonCrack({
  Component,
  pageProps,
}: AppProps<{
  initialSession: Session;
}>) {
  const router = useRouter();
  const setSession = useUser(state => state.setSession);

  React.useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setSession(session);
    });
  }, [setSession]);

  React.useEffect(() => {
    const handleRouteChange = (page: string) => {
      ReactGA.send({ hitType: "pageview", page });
    };

    router.events.on("routeChangeComplete", handleRouteChange);

    return () => {
      router.events.off("routeChangeComplete", handleRouteChange);
    };
  }, [router.events]);

  return (
    <>
      <Head>
        <title>JSON Crack | More Than a JSON Editor</title>
      </Head>
      <SessionContextProvider supabaseClient={supabase}>
        <MantineProvider theme={mantineTheme}>
          <ThemeProvider theme={lightTheme}>
            <GlobalStyle />
            <Component {...pageProps} />
            <ModalController />
            <Toaster
              position="bottom-right"
              containerStyle={{
                bottom: 34,
                right: 8,
                fontSize: 14,
              }}
              toastOptions={{
                style: {
                  background: "#4D4D4D",
                  color: "#B9BBBE",
                  borderRadius: 4,
                },
              }}
            />
            <ExternalMode />
          </ThemeProvider>
        </MantineProvider>
      </SessionContextProvider>
    </>
  );
}

export default JsonCrack;
