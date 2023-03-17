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
import pinyin from "pinyin";

type AudioLabelerProps = {
  audio: string;
  text: string;
  pinYin: string;
  onPrev: () => void;
  onNext: () => void;
  onSave: () => void;
  onDelete: () => void;
  setText: (text: string) => void;
  setPinYin: (pinYin: string) => void;
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
  setText,
  pinYin,
  setPinYin,
}: AudioLabelerProps) => {
  const [autoPlay, setAutoPlay] = useState(true);
  const [autoPinYin, setAutoPinYin] = useState(true);
  const [autoNext, setAutoNext] = useState(true);

  useEffect(() => {
    const handleKeyPress = (event: any) => {
      if (autoNext && event.keyCode === 13 && !!pinYin) {
        event.preventDefault();
        onNext();
      }

      // Ignore Enter
      if (event.keyCode === 13) {
        event.preventDefault();
      }

      // If Command + S is pressed
      if (event.keyCode === 83 && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        onSave();
      }
    };

    // attach the event listener
    document.addEventListener("keydown", handleKeyPress);

    // remove the event listener
    return () => {
      document.removeEventListener("keydown", handleKeyPress);
    };
  }, [pinYin, autoNext, onSave, onNext]);

  useEffect(() => {
    setAutoNext(getBooleanFromLocalStorage("autoNext", true));
    setAutoPlay(getBooleanFromLocalStorage("autoPlay", true));
    setAutoPinYin(getBooleanFromLocalStorage("autoPinYin", true));
  }, []);

  const onUpdateAutoPlay = (e: any) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("autoPlay", e.target.checked);
    }
    setAutoPlay(e.target.checked);
  };

  const onUpdateAutoPinYin = (e: any) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("autoPinYin", e.target.checked);
    }
    setAutoPinYin(e.target.checked);
  };

  const onUpdateAutoNext = (e: any) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("autoNext", e.target.checked);
    }
    setAutoNext(e.target.checked);
  };

  const onUpdateText = (e: any) => {
    setText(e.target.value);

    if (autoPinYin) {
      const pinyinResult = pinyin(e.target.value, {
        style: pinyin.STYLE_NORMAL,
      });

      setPinYin(pinyinResult.map((item) => item[0]).join(" "));
    }
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
            label="自动播放"
            onChange={onUpdateAutoPlay}
            disabled={disabled}
          />
          <FormControlLabel
            control={<Switch checked={autoPinYin} />}
            label="更新拼音"
            onChange={onUpdateAutoPinYin}
            disabled={disabled}
          />
          <FormControlLabel
            control={<Switch checked={autoNext} />}
            label="回车自动下一个"
            onChange={onUpdateAutoNext}
            disabled={disabled}
          />
        </FormGroup>
      </PaperWithPadding>
      <PaperWithPadding>
        <Stack spacing={2}>
          <TextField
            label="中文"
            multiline
            fullWidth
            rows={2}
            onChange={onUpdateText}
            value={text}
            disabled={disabled}
          />

          <TextField
            label="拼音 (自动转换)"
            multiline
            fullWidth
            rows={4}
            value={pinYin}
            onChange={(e) => setPinYin(e.target.value)}
            disabled={disabled}
          />
        </Stack>
      </PaperWithPadding>
      <PaperWithPadding>
        <Stack spacing={2} direction="row">
          <Button variant="outlined" fullWidth onClick={onPrev}>
            上一个
          </Button>
          <Button variant="outlined" fullWidth onClick={onNext}>
            下一个 {autoNext ? "(Enter)" : ""}
          </Button>
          <Button variant="outlined" fullWidth onClick={onSave}>
            保存 (Ctrl + S)
          </Button>
          <Button variant="outlined" fullWidth onClick={onDelete} color="error">
            删除
          </Button>
        </Stack>
      </PaperWithPadding>
    </Stack>
  );
};

export default AudioLabeler;
