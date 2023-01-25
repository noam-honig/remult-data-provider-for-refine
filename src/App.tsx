import React, { useMemo } from "react";

import { Refine, ResourceProps } from "@pankod/refine-core";
import {
  notificationProvider,
  RefineSnackbarProvider,
  CssBaseline,
  GlobalStyles,
  Layout,
  ThemeProvider,
  LightTheme,
  ReadyPage,
  ErrorComponent,
} from "@pankod/refine-mui";

import { dataProvider } from "./remult-utils/remult-data-provider";
import routerProvider from "@pankod/refine-react-router-v6";
import { MuiInferencer } from "@pankod/refine-inferencer/mui";
import { entities } from "./shared";
import { remult } from "remult";

function App() {
  const resources = useMemo(() => {
    const result: ResourceProps[] = [];
    for (const e of entities) {
      const m = remult.repo(e as any).metadata;
      result.push({
        name: m.key,
        canDelete: m.apiDeleteAllowed,
        list: MuiInferencer,
        create: m.apiInsertAllowed ? MuiInferencer : undefined,
        edit: m.apiUpdateAllowed ? MuiInferencer : undefined,
      });
    }
    return result;
  }, []);

  return (
    <ThemeProvider theme={LightTheme}>
      <CssBaseline />
      <GlobalStyles styles={{ html: { WebkitFontSmoothing: "auto" } }} />
      <RefineSnackbarProvider>
        <Refine
          dataProvider={dataProvider(entities)}
          notificationProvider={notificationProvider}
          Layout={Layout}
          ReadyPage={ReadyPage}
          catchAll={<ErrorComponent />}
          routerProvider={routerProvider}
          resources={resources}
        />
      </RefineSnackbarProvider>
    </ThemeProvider>
  );
}

export default App;
