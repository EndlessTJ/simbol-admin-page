"use client";
import React, { FC, useEffect } from "react";
import { Form, Modal, theme, FormInstance } from "antd";
import {ModalFormHandleStatus, ModalFormText } from "@/type";
export interface FormModalProps<ValueType = any> {
  modalTitle: string;
  show: boolean;
  confirmLoading: boolean;
  initValues?: ValueType;
  // status: keyof typeof ModalFormText;
  handleOk: (handleType: ModalFormHandleStatus, form: FormInstance) => void;
  handleCancel: (handleType: ModalFormHandleStatus) => void;
  onFinish: (values: ValueType) => void;
  children: React.ReactNode;
}

const FormModal: FC<FormModalProps<any>> = ({
  modalTitle,
  show,
  confirmLoading,
  initValues,
  // status,
  handleCancel,
  handleOk,
  onFinish,
  children
}) => {
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
        {...formItemLayout}
      >
        {children}
      </Form>
    </Modal>
  );
};

export default FormModal;
