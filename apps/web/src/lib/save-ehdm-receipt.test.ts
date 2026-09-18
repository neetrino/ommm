import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";
import {
  buildEhdmReceiptFileName,
  downloadReceiptBlob,
} from "./save-ehdm-receipt";

const IPHONE_SAFARI_UA =
  "Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Mobile/15E148 Safari/604.1";
const ANDROID_CHROME_UA =
  "Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Mobile Safari/537.36";

type ClickedDownload = {
  href: string;
  download: string;
};

type DownloadDom = {
  clicked: ClickedDownload[];
  shareCalls: number;
  restore: () => void;
};

function installDownloadDom(userAgent: string): DownloadDom {
  const clicked: ClickedDownload[] = [];
  let shareCalls = 0;
  const previous = {
    document: globalThis.document,
    navigator: globalThis.navigator,
    URL: globalThis.URL,
    window: globalThis.window,
  };

  const anchor = {
    href: "",
    download: "",
    rel: "",
    click() {
      clicked.push({ href: this.href, download: this.download });
    },
    remove() {
      return undefined;
    },
  };

  Object.defineProperty(globalThis, "navigator", {
    configurable: true,
    value: {
      userAgent,
      canShare: () => true,
      share: async () => {
        shareCalls += 1;
        throw new Error("navigator.share must not run on receipt download");
      },
    },
  });
  Object.defineProperty(globalThis, "URL", {
    configurable: true,
    value: {
      createObjectURL: () => "blob:receipt-test",
      revokeObjectURL: () => undefined,
    },
  });
  Object.defineProperty(globalThis, "document", {
    configurable: true,
    value: {
      createElement: () => anchor,
      body: {
        append: () => undefined,
      },
    },
  });
  Object.defineProperty(globalThis, "window", {
    configurable: true,
    value: {
      setTimeout: (fn: () => void) => {
        fn();
        return 0;
      },
    },
  });

  return {
    clicked,
    get shareCalls() {
      return shareCalls;
    },
    restore() {
      Object.defineProperty(globalThis, "document", {
        configurable: true,
        value: previous.document,
      });
      Object.defineProperty(globalThis, "navigator", {
        configurable: true,
        value: previous.navigator,
      });
      Object.defineProperty(globalThis, "URL", {
        configurable: true,
        value: previous.URL,
      });
      Object.defineProperty(globalThis, "window", {
        configurable: true,
        value: previous.window,
      });
    },
  };
}

const installedDoms: DownloadDom[] = [];

afterEach(() => {
  while (installedDoms.length > 0) {
    installedDoms.pop()?.restore();
  }
});

function downloadOnDevice(userAgent: string): DownloadDom {
  const dom = installDownloadDom(userAgent);
  installedDoms.push(dom);
  downloadReceiptBlob(new Blob(["png"], { type: "image/png" }), "Ommm-receipt-x.png");
  return dom;
}

describe("save-ehdm-receipt", () => {
  it("builds a stable PNG filename from the payment reference", () => {
    assert.equal(
      buildEhdmReceiptFileName("PACKAGE-2818A5C8575F"),
      "Ommm-receipt-PACKAGE-2818A5C8575F.png",
    );
  });

  it("strips unsafe characters and falls back without a reference", () => {
    assert.equal(
      buildEhdmReceiptFileName("  pkg/one  two  "),
      "Ommm-receipt-pkg-one-two.png",
    );
    assert.equal(buildEhdmReceiptFileName(null), "Ommm-receipt-fiscal.png");
    assert.equal(buildEhdmReceiptFileName("   "), "Ommm-receipt-fiscal.png");
  });

  it("installs the PNG on iPhone Safari without opening Share", () => {
    const dom = downloadOnDevice(IPHONE_SAFARI_UA);
    assert.equal(dom.shareCalls, 0);
    assert.deepEqual(dom.clicked, [
      { href: "blob:receipt-test", download: "Ommm-receipt-x.png" },
    ]);
  });

  it("installs the PNG on Android Chrome without opening Share", () => {
    const dom = downloadOnDevice(ANDROID_CHROME_UA);
    assert.equal(dom.shareCalls, 0);
    assert.deepEqual(dom.clicked, [
      { href: "blob:receipt-test", download: "Ommm-receipt-x.png" },
    ]);
  });
});
