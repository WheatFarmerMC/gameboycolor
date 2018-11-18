import React from "react";
import PropTypes from "prop-types";

import { useGameStyles } from "./LibraryStyles";

import GridListTile from "@material-ui/core/GridListTile";
import GridListTileBar from "@material-ui/core/GridListTileBar";
import ButtonBase from "@material-ui/core/ButtonBase";

const Game = props => {
  const { thumb, title } = props;
  const [imageError, setImageError] = React.useState(false);
  const classes = useGameStyles();

  const handleImageError = () => {
    setImageError(true);
  };

  const handleROMSelection = () => {
    props.setCurrentROM(props.rom);
  };

  const formattedTitle = () => {
    const START = 0,
      TITLE_LENGTH = 50,
      HALF = 2,
      overflow = title.length - TITLE_LENGTH,
      OVERFLOW_THRESHOLD = 0,
      sliceLength = Math.trunc(TITLE_LENGTH / HALF);

    if (overflow > OVERFLOW_THRESHOLD) {
      return `${title.substr(START, sliceLength)}…${title.substr(
        title.length - sliceLength,
        title.length
      )}`;
    }

    return title;
  };

  return (
    <GridListTile className={classes.game}>
      <ButtonBase onClick={handleROMSelection}>
        {!thumb || thumb === `reattempt` || imageError ? (
          <div aria-label={title} className={classes.gameImageError} />
        ) : (
          <img
            alt={title}
            className={classes.gameImage}
            onError={handleImageError}
            src={thumb}
          />
        )}
      </ButtonBase>
      <GridListTileBar
        classes={{
          root: classes.gameTitleRoot,
          titleWrap: classes.gameTitleWrap,
          title: classes.gameTitleText
        }}
        title={formattedTitle()}
      />
    </GridListTile>
  );
};

Game.propTypes = {
  setCurrentROM: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  thumb: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]).isRequired,
  rom: PropTypes.string
};

Game.defaultProps = { rom: `` };

export default Game;
