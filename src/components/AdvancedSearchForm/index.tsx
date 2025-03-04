"use client";
import React, { useState, FC } from "react";
import { DownOutlined } from "@ant-design/icons";
import { Button, Form, Row, Space, theme } from "antd";
import { CommonType } from "@/type";

// const { Option } = Select;
export interface AdvancedSearchFormProps {
  onFinish: (values: CommonType) => void;
  onShowHide?: (flag: boolean) => void;
  children: React.ReactNode;
}

const AdvancedSearchForm: FC<AdvancedSearchFormProps> = ({
  onFinish,
  onShowHide,
  children,
}) => {
  const { token } = theme.useToken();
  const [form] = Form.useForm();
  const [expand, setExpand] = useState(false);

  const formStyle: React.CSSProperties = {
    maxWidth: "none",
    background: token.colorFillAlter,
    borderRadius: token.borderRadiusLG,
    padding: 24,
  };

  return (
    <Form
      form={form}
      name="advanced_search"
      style={formStyle}
      onFinish={onFinish}
    >
      <Row gutter={24}>{children}</Row>
      <div style={{ textAlign: "right" }}>
        <Space size="small">
          <Button type="primary" htmlType="submit">
            搜索
          </Button>
          <Button
            onClick={() => {
              form.resetFields();
            }}
          >
            重置
          </Button>
          {onShowHide ? (
            <a
              style={{ fontSize: 12 }}
              onClick={() => {
                setExpand(!expand);
                onShowHide?.(!expand);
              }}
            >
              <DownOutlined rotate={expand ? 180 : 0} />{" "}
              {expand ? "折叠" : "展开"}
            </a>
          ) : null}
        </Space>
      </div>
    </Form>
  );
};

export default AdvancedSearchForm;
