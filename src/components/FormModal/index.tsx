"use client";
import React, { useEffect } from "react";
import { Form, Modal, theme, FormInstance } from "antd";
import {CommonType, ModalFormHandleStatus } from "@/type";
export interface FormModalProps<ValueType = unknown> {
  modalTitle: string;
  show: boolean;
  confirmLoading: boolean;
  initValues?: ValueType;
  handleOk: (handleType: ModalFormHandleStatus, form: FormInstance) => void;
  handleCancel: (handleType: ModalFormHandleStatus) => void;
  onFinish: (values: ValueType) => void;
  onValuesChange?: (changedValues: CommonType, allValues: ValueType) => void;
  children: React.ReactNode;
}

const FormModal = <ValueType,>({
  modalTitle,
  show,
  confirmLoading,
  initValues,
  handleCancel,
  handleOk,
  onFinish,
  onValuesChange,
  children
}:FormModalProps<ValueType>) => {
  const { token } = theme.useToken();
  const [form] = Form.useForm();

  useEffect(() => {
    form.setFieldsValue(initValues)
  }, [initValues])
  
  const formStyle: React.CSSProperties = {
    maxWidth: "none",
    background: token.colorFillAlter,
    borderRadius: token.borderRadiusLG,
    padding: 24,
  };

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

  const modalAfterClose = () => {
    form.resetFields();
  }

  return (
    <Modal
      title={modalTitle}
      open={show}
      onOk={() => handleOk("CONFIRM",form)}
      confirmLoading={confirmLoading}
      onCancel={() => handleCancel("CLOSE")}
      cancelText="取消"
      okText="提交"
      afterClose={modalAfterClose}
      // destroyOnClose={true}
    >
      <Form
        form={form}
        // initialValues={initValues}
        name="partner-edit"
        style={formStyle}
        onFinish={onFinish}
        onValuesChange={onValuesChange}
        {...formItemLayout}
      >
        {children}
      </Form>
    </Modal>
  );
};

export default FormModal;
