import {
  Button,
  FormControlLabel,
  FormGroup,
  Stack,
  Switch,
  TextField,
} from "@mui/material";
import AudioPlayer from "react-h5-audio-player";
import "react-h5-audio-player/lib/styles.css";
import PaperWithPadding from "./PaperWithPadding";
import { useEffect, useState } from "react";

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

  const disabled = !audio;

  return (
    <Stack spacing={2}>
      <PaperWithPadding>
        <AudioPlayer
          autoPlay={false}
          autoPlayAfterSrcChange={autoPlay}
          src={audio}
        />
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
            rows={2}
            onChange={onUpdateText}
            value={tempText}
            disabled={disabled}
          />
        </Stack>
      </PaperWithPadding>
      <PaperWithPadding>
        <Stack spacing={2} direction="row">
          <Button variant="outlined" fullWidth onClick={() => onPrev(tempText)}>
            上一个 / PREV
          </Button>
          <Button variant="outlined" fullWidth onClick={() => onNext(tempText)}>
            下一个 / NEXT {autoNext ? "(Enter)" : ""}
          </Button>
          <Button variant="outlined" fullWidth onClick={() => onSave(tempText)}>
            保存 / SAVE <br /> (Ctrl + S)
          </Button>
          <Button variant="outlined" fullWidth onClick={onDelete} color="error">
            删除 / DELETE
          </Button>
        </Stack>
      </PaperWithPadding>
    </Stack>
  );
};

export default AudioLabeler;
