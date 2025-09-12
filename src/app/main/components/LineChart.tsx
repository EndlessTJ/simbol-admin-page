"use client";
import React, { useEffect, useRef } from 'react';
import * as echarts from "echarts";

// type Props = {
//   data: string[]
// };
type EChartsOption = echarts.EChartsOption;
const chartOptionData: EChartsOption = {
  xAxis: {
    type: "category",
    data: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
  },
  yAxis: {
    type: "value",
  },
  series: [
    {
      data: [150, 230, 224, 218, 135, 147, 260],
      type: "line",
    },
  ],
};

const LineChart = () => {
  const chartRef = useRef(null);

  useEffect(() => {

    // 挂载echarts
    // 挂载阶段
    const chart = echarts.init(chartRef.current);

    chart.setOption(chartOptionData);

    // 销毁
    return () => {
      chart.dispose();

    };
  }, []);
  return (
    <div ref={chartRef} style={{ width: "100%", height: "560px" }}></div>
  )
}

export default LineChart;