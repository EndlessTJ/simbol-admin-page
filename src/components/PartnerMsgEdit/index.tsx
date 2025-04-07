"use client";
import React, { useState, FC, useEffect } from "react";
import { Select, Form, Input, Modal, DatePicker, theme, FormInstance } from "antd";
import { PartnerChannelType, ProductsType, ModalFormText } from "@/type";
import { CooperationStatus, Company } from "@/constants";
import _, { create } from "lodash";
export interface PartnerMsgEditProps {
  modalTitle: string;
  show: boolean;
  confirmLoading: boolean;
  initValues?: PartnerChannelType;
  status: keyof typeof ModalFormText;
  handleOk: (handleType: "close" | "confirm" | "create" | "update", form: FormInstance) => void;
  handleCancel: (handleType: "close" | "confirm" | "create" | "update", form: FormInstance) => void;
  onFinish: (values: PartnerChannelType) => void;
}

const PartnerMsgEdit: FC<PartnerMsgEditProps> = ({
  modalTitle,
  show,
  confirmLoading,
  initValues,
  status,
  handleCancel,
  handleOk,
  onFinish,
}) => {
  const { token } = theme.useToken();
  const [form] = Form.useForm();
  const [products, setProducts] = useState<ProductsType[]>([]);
  useEffect(() => {
    if(status === 'UPDATE' && initValues?.name){
      getProductsByComponyName(initValues?.name);
      form.setFieldsValue(initValues)
    }
    if(status === "CREATE") {
      form.setFieldsValue({
        name: "",
        contractDate: "",
        currentStatus: "",
        signCompony: "",
        alias: "",
        remark: ""
      })
    }
  } , [status, initValues])
  
  const formStyle: React.CSSProperties = {
    maxWidth: "none",
    background: token.colorFillAlter,
    borderRadius: token.borderRadiusLG,
    padding: 24,
  };

  const getProductsByComponyName = (componyName: string) => {}

  const formItemLayout = {
    labelCol: {
      xs: { span: 24 },
      sm: { span: 4 },
    },
    wrapperCol: {
      xs: { span: 24 },
      sm: { span: 20 },
    },
  };

  return (
    <Modal
      title={modalTitle}
      open={show}
      onOk={() => {handleOk("confirm",form);}}
      confirmLoading={confirmLoading}
      onCancel={() => handleCancel("close", form)}
      cancelText="取消"
      okText="提交"
      destroyOnClose={true}
    >
      <Form
        form={form}
        initialValues={initValues}
        name="partner-edit"
        style={formStyle}
        onFinish={onFinish}
        {...formItemLayout}
      >
        <Form.Item name="name" label="公司名称">
          <Input placeholder="请输入" />
        </Form.Item>
        <Form.Item name="contractDate" label="签约日期">
          <DatePicker placeholder="请选择" />
        </Form.Item>
        <Form.Item name="currentStatus" label="合作状态">
          <Select
            placeholder="请选择"
            options={Object.keys(CooperationStatus).map((value: string) => ({
              value,
              label: CooperationStatus[value as keyof typeof CooperationStatus],
            }))}
          ></Select>
        </Form.Item>
        <Form.Item name="signCompony" label="签约主体">
          <Select
          placeholder="请选择"
            options={Object.values(Company).map((value: string) => ({
              value,
              label: value,
            }))}
          ></Select>
        </Form.Item>
        {status === "UPDATE" && (
          <Form.Item name="products" label="合作产品">
            <Select
            placeholder="请选择"
              mode="multiple"
              options={(products as ProductsType[]).map(
                (value: ProductsType) => ({
                  value: value.id,
                  label: value.name,
                })
              )}
            ></Select>
          </Form.Item>
        )}

        <Form.Item  name="alias" label="公司别名">
          <Input placeholder="请输入" />
        </Form.Item>
        <Form.Item name="remark" label="备注">
          <Input.TextArea rows={6} />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default PartnerMsgEdit;
