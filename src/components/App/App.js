import React from "react";

import { MuiThemeProvider } from "@material-ui/core/styles";
import CssBaseline from "@material-ui/core/CssBaseline";
import theme from "../../theme";
import { useAppStyles } from "./AppStyles";

import Context, { appContext } from "../Context/Context";
import initialState from "./initialState";
import Hydrate from "../Hydrate/Hydrate";
import FirstUse from "../FirstUse/FirstUse";
import Gamepad from "../Gamepad/GamepadView";
import Emulator from "../Emulator/Emulator";
import Sound from "../Sound/Sound";
import Settings from "../Settings/Settings";
import Library from "../Library/Library";
import Notification from "../Notification/Notification";
import Upgrade from "../Upgrade/Upgrade";

import * as actions from "../actions/appActions";

const useCustomTouchBehavior = () => {
  React.useEffect(() => {
    const root = document.getElementById(`root`);

    root.addEventListener(
      `touchstart`,
      e => {
        if (
          e.target.closest(`[class*="GamepadView"]`) ||
          e.target.closest(`canvas`)
        ) {
          e.preventDefault();
        }
      },
      { passive: false }
    );

    root.addEventListener(`touchmove`, e => e.preventDefault(), {
      passive: false
    });
  }, []);
};

const App = () => {
  useCustomTouchBehavior();
  useAppStyles();

  const state = React.useContext(appContext);

  return (
    <Context initialState={initialState}>
      <MuiThemeProvider theme={theme}>
        <CssBaseline />

        <Hydrate />
        {state.hydrated && state.settings.firstUse && <FirstUse />}
        <Emulator />
        <Sound />
        <Gamepad />
        <Settings />
        <Library />
        <Notification
          autoHide={1000}
          open={Boolean(state.message)}
          onClose={actions.hideMessage}
        >
          {state.message}
        </Notification>

        <Upgrade />
      </MuiThemeProvider>
    </Context>
  );
};

export default React.memo(App, () => true);
