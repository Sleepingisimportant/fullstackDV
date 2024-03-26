import { saveAs } from "file-saver";

//handle download the configured chart
export function downloadChart(chartRef) {
  if (chartRef.current === null) return;
  const svgElement = chartRef.current.querySelector("svg");
  const svgString = new XMLSerializer().serializeToString(svgElement);
  const blob = new Blob([svgString], { type: "image/svg+xml" });
  saveAs(blob, "chart.svg");
}
