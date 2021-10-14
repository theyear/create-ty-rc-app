import { render } from "@testing-library/react";

import App from "../src/App";

describe("App", () => {
  it("snapshot", () => {
    const { asFragment } = render(<App />);
    expect(asFragment()).toMatchSnapshot();
  });

  it("content", async () => {
    const { baseElement } = render(<App />);

    expect(baseElement.textContent).toEqual("hello");
  });
});
