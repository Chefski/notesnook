import React, { useEffect } from "react";
import "./editor.css";
import ReactQuill from "./react-quill";
import { Flex, Box, Text } from "rebass";
import TitleBox from "./title-box";
import * as Icon from "react-feather";
import Properties from "../properties";
import { useStore, SESSION_STATES } from "../../stores/editor-store";
import { timeConverter } from "../../utils/time";
import { countWords } from "../../utils/string";
import { useTheme } from "emotion-theming";

const TextSeperator = props => {
  const theme = useTheme();
  return (
    <Text as="span" mx={1}>
      <Icon.Circle size={6} fill={theme.colors.fontTertiary} />
    </Text>
  );
};

function Editor() {
  const title = useStore(store => store.session.title);
  const dateEdited = useStore(store => store.session.dateEdited);
  const text = useStore(store => store.session.content.text);
  const isSaving = useStore(store => store.session.isSaving);
  const delta = useStore(store => store.session.content.delta);
  const sessionState = useStore(store => store.session.state);
  const setSession = useStore(store => store.setSession);
  const saveSession = useStore(store => store.saveSession);
  const reopenLastSession = useStore(store => store.reopenLastSession);

  useEffect(() => {
    // move the toolbar outside (easiest way)
    const toolbar = document.querySelector(".ql-toolbar.ql-snow");
    const toolbarContainer = document.querySelector("#toolbar");
    if (toolbar && toolbarContainer) {
      toolbarContainer.appendChild(toolbar);
    }
  }, []);

  useEffect(() => {
    reopenLastSession();
  }, [reopenLastSession]);

  return (
    <Flex width={["0%", "0%", "100%"]} sx={{ position: "relative" }}>
      <Flex className="editor" flex="1 1 auto" flexDirection="column">
        <TitleBox
          shouldFocus={sessionState === SESSION_STATES.new}
          title={title}
          setTitle={title =>
            setSession(state => {
              state.session.title = title;
            })
          }
          sx={{
            paddingTop: 2,
            paddingBottom: dateEdited > 0 ? 0 : 2
          }}
        />
        {dateEdited > 0 && (
          <Text
            fontSize={"subBody"}
            mx={2}
            color="fontTertiary"
            sx={{ display: "flex", alignItems: "center", marginBottom: 2 }}
          >
            {timeConverter(dateEdited)}
            <TextSeperator />
            {countWords(text) + " words"}
            <TextSeperator />
            {isSaving ? "Saving" : "Saved"}
          </Text>
        )}
        <Box id="toolbar" display={["none", "flex", "flex"]} />
        <ReactQuill
          refresh={sessionState === SESSION_STATES.new}
          initialContent={delta}
          placeholder="Type anything here"
          container=".editor"
          onSave={() => {
            saveSession();
          }}
          onChange={editor => {
            setSession(state => {
              state.session.content = {
                delta: editor.getContents(),
                text: editor.getText()
              };
            });
          }}
        />
      </Flex>
      <Properties />
    </Flex>
  );
}

export default Editor;
