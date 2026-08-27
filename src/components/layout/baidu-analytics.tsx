"use client";

import { useEffect } from "react";

/**
 * 百度统计追踪代码（官方异步加载版）
 * 仅在客户端运行时注入 hm.baidu.com/hm.js，避免 SSR hydration 不一致。
 */
const BAIDU_HM_ID = "a455636803f4d7d58951314b5594ca83";

export function BaiduAnalytics() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    // 避免重复注入
    if (document.querySelector(`script[data-baidu-hm="${BAIDU_HM_ID}"]`)) {
      return;
    }

    const _hmt = ((window as unknown as { _hmt?: unknown[] })._hmt =
      (window as unknown as { _hmt?: unknown[] })._hmt || []);

    const hm = document.createElement("script");
    hm.type = "text/javascript";
    hm.async = true;
    hm.charset = "utf-8";
    hm.dataset.baiduHm = BAIDU_HM_ID;
    hm.src = `https://hm.baidu.com/hm.js?${BAIDU_HM_ID}`;

    const s = document.getElementsByTagName("script")[0];
    if (s?.parentNode) {
      s.parentNode.insertBefore(hm, s);
    } else {
      document.head.appendChild(hm);
    }
  }, []);

  return null;
}
