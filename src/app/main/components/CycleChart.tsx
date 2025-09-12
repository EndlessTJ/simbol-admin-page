"use client";
import React, { useEffect, useRef } from 'react';
import * as echarts from "echarts";

type Props = {
  data?: Array<{name: string, value: number}>
};

const CycleChart = (props: Props) => {
  const chartRef = useRef(null);

  useEffect(() => {

    // 挂载echarts
    // 挂载阶段
    const chart = echarts.init(chartRef.current);

    chart.setOption({
      title: {
        text: "支出数据",
        subtext: "不同分类",
        left: "center",
      },
      tooltip: {
        trigger: "item",
      },
      legend: {
        orient: "vertical",
        left: "left",
      },
      series: [
        {
          name: "Access From",
          type: "pie",
          radius: "50%",
          data: props.data || [],
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: "rgba(0, 0, 0, 0.5)",
            },
          },
        },
      ],
    });

    // 销毁
    return () => {
      chart.dispose();

    };
  }, [props.data]);
  return (
    <div ref={chartRef} style={{ width: "100%", height: "500px" }}></div>
  )
}

export default CycleChart;