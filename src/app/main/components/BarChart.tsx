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
  }[]};

const BarChart = (props: Props) => {
  const chartRef = useRef(null);

  useEffect(() => {
    const chart = echarts.init(chartRef.current);
    chart.setOption({
      title: {
        text: '收支数据'
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        }
      },
      legend: {
        data: props.legend
      },
      xAxis: {
        type: "category",
        boundaryGap: false,
        data: props.category,
      },
      yAxis: {
        type: "value",
      },
      series: props.data
    });

    // 销毁
    return () => {
      chart.dispose();

    };
  }, [props.category, props.data, props.legend]);
  return (
    <div ref={chartRef} style={{ width: "100%", height: "560px" }}></div>
  )
}

export default BarChart;