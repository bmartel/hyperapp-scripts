import { h, text } from "hyperapp";
import logo from "./logo.svg";
import "./App.css";

const div = ({ ...state }, children: any) => h("div", state, children);
const p = ({ ...state }, children: any) => h("p", state, children);
const header = ({ ...state }, children: any) => h("header", state, children);
const code = ({ ...state }, children: any) => h("code", state, children);
const img = ({ ...state }) => h("img", state);

const App = () =>
  div({ class: "App" }, [
    header({ class: "App-header" }, [
      img({ src: logo, class: "App-logo", alt: "logo" }),
      p({}, [
        text("Edit "),
        code({}, text("src/App.js")),
        text(" and save to reload")
      ]),
      a(
        {
          class: "App-link",
          href: "https://hyperapp.dev",
          target: "_blank",
          rel: "noopener noreferrer"
        },
        text("Learn Hyperapp")
      )
    ])
  ]);

export default App;
