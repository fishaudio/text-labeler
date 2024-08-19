import {
  Button,
  FormControlLabel,
  FormGroup,
  Stack,
  Switch,
  TextField,
  Snackbar,
} from "@mui/material";
import AudioPlayer from "react-h5-audio-player";
import "react-h5-audio-player/lib/styles.css";
import PaperWithPadding from "./PaperWithPadding";
import { useEffect, useState, useRef } from "react";
import { useWavesurfer } from "@wavesurfer/react";

type AudioLabelerProps = {
  audio: string;
  text: string;
  onPrev: (text: string) => void;
  onNext: (text: string) => void;
  onSave: (text: string) => void;
  onDelete: () => void;
};

const getBooleanFromLocalStorage = (key: string, defaultValue: boolean) => {
  const value = localStorage.getItem(key);
  if (value === null) {
    return defaultValue;
  }

  return value === "true";
};

const AudioLabeler = ({
  audio,
  onPrev,
  onNext,
  onSave,
  onDelete,
  text,
}: AudioLabelerProps) => {
  const [autoPlay, setAutoPlay] = useState(true);
  const [autoNext, setAutoNext] = useState(true);
  const [tempText, setTempText] = useState(text);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const containerRef = useRef(null);

  useEffect(() => {
    setTempText(text);
  }, [text]);

  useEffect(() => {
    const handleKeyPress = (event: any) => {
      if (autoNext && event.keyCode === 13) {
        event.preventDefault();
        onNext(tempText);
      }

      // Ignore Enter
      if (event.keyCode === 13) {
        event.preventDefault();
      }

      // If Command + S is pressed
      if (event.keyCode === 83 && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        onSave(tempText);
      }
    };

    // attach the event listener
    document.addEventListener("keydown", handleKeyPress);

    // remove the event listener
    return () => {
      document.removeEventListener("keydown", handleKeyPress);
    };
  }, [tempText, autoNext, onSave, onNext]);

  useEffect(() => {
    setAutoNext(getBooleanFromLocalStorage("autoNext", true));
    setAutoPlay(getBooleanFromLocalStorage("autoPlay", true));
  }, []);

  const { wavesurfer, isPlaying, currentTime } = useWavesurfer({
    container: containerRef,
    height: 100,
    waveColor: "#0BE3F7",
    progressColor: "#0497EB",
    url: audio,
  });

  const onUpdateAutoPlay = (e: any) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("autoPlay", e.target.checked);
    }
    setAutoPlay(e.target.checked);
  };

  const onUpdateAutoNext = (e: any) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("autoNext", e.target.checked);
    }
    setAutoNext(e.target.checked);
  };

  const onUpdateText = (e: any) => {
    setTempText(e.target.value);
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  const showSnackbar = (message: string) => {
    setSnackbarMessage(message);
    setSnackbarOpen(true);
  };

  const handleTimeUpdate = (e: any) => {
    wavesurfer?.setTime(e.target.currentTime);
  };

  const disabled = !audio;

  return (
    <Stack spacing={2}>
      <PaperWithPadding>
        <Stack spacing={2}>
          <AudioPlayer
            autoPlay={false}
            autoPlayAfterSrcChange={autoPlay}
            src={audio}
            onListen={handleTimeUpdate}
            onSeeking={handleTimeUpdate}
            onSeeked={handleTimeUpdate}
            progressUpdateInterval={100} // ms
            listenInterval={100} // ms
          />
          <div ref={containerRef} style={{ margin: "1.25rem" }} />
        </Stack>
      </PaperWithPadding>
      <PaperWithPadding>
        <FormGroup row>
          <FormControlLabel
            control={<Switch checked={autoPlay} />}
            label="自动播放 / Autoplay"
            onChange={onUpdateAutoPlay}
            disabled={disabled}
          />
          <FormControlLabel
            control={<Switch checked={autoNext} />}
            label="回车自动下一个 / Enter For Next"
            onChange={onUpdateAutoNext}
            disabled={disabled}
          />
        </FormGroup>
      </PaperWithPadding>
      <PaperWithPadding>
        <Stack spacing={2}>
          <TextField
            label="标签文本 / Label Text"
            multiline
            fullWidth
            rows={4}
            onChange={onUpdateText}
            value={tempText}
            disabled={disabled}
          />
        </Stack>
      </PaperWithPadding>
      <PaperWithPadding>
        <Stack spacing={2} direction="row">
          <Button
            variant="outlined"
            fullWidth
            onClick={() => {
              onPrev(tempText);
              showSnackbar("已切换到上一个 / Switched to PREV");
            }}
          >
            上一个 / PREV
          </Button>
          <Button
            variant="outlined"
            fullWidth
            onClick={() => {
              onNext(tempText);
              showSnackbar("已切换到下一个 / Switched to NEXT");
            }}
          >
            下一个 / NEXT {autoNext ? "(Enter)" : ""}
          </Button>
          <Button
            variant="outlined"
            fullWidth
            onClick={() => {
              onSave(tempText);
              showSnackbar("已保存 / Saved");
            }}
          >
            保存 / SAVE <br /> (Ctrl + S)
          </Button>
          <Button
            variant="outlined"
            fullWidth
            onClick={() => {
              onDelete();
              showSnackbar("已删除 / Deleted");
            }}
            color="error"
          >
            删除 / DELETE
          </Button>
        </Stack>
      </PaperWithPadding>
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={handleSnackbarClose}
        message={snackbarMessage}
      />
    </Stack>
  );
};

export default AudioLabeler;
