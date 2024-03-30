import { saveAs } from "file-saver";

function DownloadChart({chartRef}) {
  function download() {
    if (chartRef.current === null) return;
    const svgElement = chartRef.current.querySelector("svg");
    const svgString = new XMLSerializer().serializeToString(svgElement);
    console.log(svgElement);
    const blob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
    saveAs(blob, "chart.svg");
  }

  return (
    <div className="button-container">
      <div className={` button `} onClick={() => download()}>
        DOWNLOAD CHART
      </div>
    </div>
  );
}

export default DownloadChart;

// function DownloadChart({ selectedFileID, selectedCycleNum }) {
//   return (
//     <div className="button-container">
//       <div className={` button `} onClick={() => downloadChart(chartRef)}>
//         DOWNLOAD CHART
//       </div>
//     </div>
//   );
// }
