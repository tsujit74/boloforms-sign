export function relativeToPixels(rel, renderedWidth, renderedHeight) {
  return {
    left: rel.x * renderedWidth,
    top: rel.y * renderedHeight,
    width: rel.w * renderedWidth,
    height: rel.h * renderedHeight,
  };
}

export function pixelsToRelative(px, renderedWidth, renderedHeight) {
  return {
    x: px.left / renderedWidth,
    y: px.top / renderedHeight,
    w: px.width / renderedWidth,
    h: px.height / renderedHeight,
  };
}

export function relativeToPdfPoints(rel, pdfOriginalWidth, pdfOriginalHeight) {
  const xPts = rel.x * pdfOriginalWidth;
  const wPts = rel.w * pdfOriginalWidth;

  const yPts = pdfOriginalHeight - (rel.y + rel.h) * pdfOriginalHeight;
  const hPts = rel.h * pdfOriginalHeight;

  return { x: xPts, y: yPts, w: wPts, h: hPts };
}

export function buildBackendFields(fields, pdfMeta) {
  return fields.map((f) => {
    const pageMeta = pdfMeta.pagesMeta?.[f.page - 1] || {
      width: pdfMeta.originalWidth,
      height: pdfMeta.originalHeight,
    };

    const pdfPts = relativeToPdfPoints(
      { x: f.x, y: f.y, w: f.w, h: f.h },
      pageMeta.width,
      pageMeta.height
    );

    return {
      id: f.id,
      type: f.type,
      page: f.page,
      relative: { x: f.x, y: f.y, w: f.w, h: f.h },
      pdfPoints: pdfPts,
      meta: f.meta || {},
    };
  });
}

export function arrayBufferToBase64(buf) {
  const view = new Uint8Array(buf);
  let binary = "";

  for (let i = 0; i < view.length; i += 0x8000) {
    binary += String.fromCharCode(...view.subarray(i, i + 0x8000));
  }

  return btoa(binary);
}
