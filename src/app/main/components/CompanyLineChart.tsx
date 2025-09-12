"use client";
import React, { useEffect, useRef } from 'react';
import * as echarts from "echarts";

type Props = {
  legend: string[];
  category: string[];
  data: {
    name: string;
    type: string;
    data: string[];
  }[];
};

const CompanyLineChart = (props: Props) => {
  const chartRef = useRef(null);

  useEffect(() => {
    // 挂载echarts
    const chart = echarts.init(chartRef.current);

    chart.setOption({
      title: {
        text: "分公司收入",
      },
      tooltip: {
        trigger: "axis",
      },
      legend: {
        data: props.legend,
        top: 30
      },
      grid: {
        left: "3%",
        right: "4%",
        bottom: "3%",
        top: 90,
        containLabel: true,
      },
      toolbox: {
        feature: {
          saveAsImage: {},
        },
      },
      xAxis: {
        type: "category",
        boundaryGap: false,
        data: props.category,
      },
      yAxis: {
        type: "value",
      },
      series: props.data,
    });

    // 销毁
    return () => {
      chart.dispose();

    };
  }, [props.category, props.data, props.legend]);
  return (
    <div ref={chartRef} style={{ width: "100%", height: "450px", marginTop: "30px" }}></div>
  )
}

export default CompanyLineChart;