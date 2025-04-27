"use client";
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { FormInstance, message, Space, TablePaginationConfig } from "antd";
// import dayjs from "dayjs";
import { usePathname } from "next/navigation";
import LocaleWrap from "@/components/LocaleConfigWrap";
import SearchActionWrap from "@/components/SearchActionWrap";
import AdvancedSearchForm from "@/components/AdvancedSearchForm";
import FormModal from "@/components/FormModal";
import {
  Col,
  Form,
  Input,
  Select,
  TableProps,
  Table,
  Button,
} from "antd";
import { requestPost, requestGet, requestPut } from "@/lib/api-client";
import {
  CommonType,
  ModalFormText,
  ModalFormHandleStatus,
  BusinessInfoType,
  BusinessInfoFormType,
  BusinessInfoQueryType,
  ChannelInfoListTypeEnum,
  ChannelInfoListStatusEnum,
} from "@/type";

const { Item } = Form;
export default function BussinessInfoList() {
  const [dataSource, setDataSource] = useState<BusinessInfoType[]>([]);
  const [updateId, setUpdateId] = useState<string>();
  const [modalShow, setModalShow] = useState<boolean>(false);
  const [initValues, setInitValues] = useState<BusinessInfoFormType>();
  const [confirmLoading, setConfirmLoading] = useState<boolean>(false);
  const [pagination, setPagination] = useState<TablePaginationConfig>();
  const [searchParams, setSearchParams] = useState<BusinessInfoQueryType>();

  const [openModalFormOpenStatus, setOpenModalFormOpenStatus] =
    useState<Exclude<ModalFormHandleStatus, "CLOSE" | "CONFIRM">>(
      "CREATE_OPEN"
    );

  const pathname = usePathname();

  const handleEditModal = useCallback(
    (handleType: ModalFormHandleStatus, form?: FormInstance) => {
      if (handleType !== "CONFIRM") {
        setModalShow(!modalShow);
      }
      if (handleType === "CREATE_OPEN" || handleType === "UPDATE_OPEN") {
        setOpenModalFormOpenStatus(handleType);
      }
      if (handleType === "CONFIRM" && form) {
        form.submit();
      }
    },
    [modalShow]
  );
  const updateItem = useCallback(
    async (record: BusinessInfoType) => {
      setUpdateId(record.id);
      handleEditModal("UPDATE_OPEN");
      setInitValues({
        ...record,
        // contactDate: dayjs(record.contactDate) as unknown as Date,
      });
    },
    [handleEditModal]
  );

  const getDataSource = useCallback(async () => {
    const data = await requestGet("/channel-info-list/list", {
      page: pagination?.current || 1,
      limit: pagination?.pageSize || 10,
      sortBy: "contactDate",
      sortOrder: "ASC",
      ...searchParams,
    });
    setDataSource(data);
  }, [pagination, searchParams]);

  useEffect(() => {
    getDataSource();
  }, [pathname, pagination, searchParams, getDataSource]);

  useEffect(() => {
    if (!confirmLoading) {
      setModalShow(false);
      getDataSource();
    }
  }, [confirmLoading, getDataSource]);

  const handleEditData = async (values: BusinessInfoFormType) => {
    try {
      setConfirmLoading(true);
      if (openModalFormOpenStatus === "CREATE_OPEN") {
        // await requestPost(`/channels/update${updateId}`, values);
        await requestPost("/channel-info-list/create", values);
      }
      if (openModalFormOpenStatus === "UPDATE_OPEN") {
        await requestPut(`/channel-info-list/update/${updateId}`, values);
      }
      setConfirmLoading(false);
      message.success("创建成功");
    } catch (error) {
      console.log(error);
    }
  };
  const onSearch = async (values: CommonType) => {
    setSearchParams(values as unknown as BusinessInfoQueryType);
  };

  const tableChange = (pagination: TablePaginationConfig) => {
    setPagination(pagination);
  };

  const columns: TableProps<BusinessInfoType>["columns"] = useMemo(
    () => [
      {
        title: "渠道名",
        dataIndex: "name",
        key: "name",
        fixed: true,
        // width: "130px",
      },
      {
        title: "类型",
        dataIndex: "type",
        key: "type",
        width: "110px",
        render: (type: keyof typeof ChannelInfoListTypeEnum) =>
          ChannelInfoListTypeEnum[type],
      },
      {
        title: "联系方式",
        dataIndex: "contactInfo",
        key: "contactInfo",
        // width: "130px",
      },
      {
        title: "状态",
        dataIndex: "status",
        key: "status",
        width: "110px",
      },
      {
        title: "联系日期",
        dataIndex: "contactDate",
        key: "contactDate",
        width: "130px",
      },

      {
        title: "备注",
        dataIndex: "remark",
        key: "remark",
        // width: "200px",
      },
      {
        title: "操作",
        key: "action",
        width: "120px",
        fixed: "right",
        render: (_, record) => (
          <Space size="middle">
            <Button onClick={() => updateItem(record)} type="link">
              修改
            </Button>
          </Space>
        ),
      },
    ],
    [updateItem]
  );
  return (
    <LocaleWrap>
      <AdvancedSearchForm onFinish={onSearch}>
        <Col span={8} key={"status"}>
          <Item name={`status`} label={`沟通状态`}>
            <Select allowClear options={Object.values(ChannelInfoListStatusEnum).map(item => ({value: item, label: item}))} />
          </Item>
        </Col>
      </AdvancedSearchForm>
      <SearchActionWrap>
        <Button
          onClick={() => {
            handleEditModal("CREATE_OPEN");
          }}
          type="primary"
        >
          创建
        </Button>
      </SearchActionWrap>

      <FormModal
        // status={handleStatus}
        handleOk={handleEditModal}
        modalTitle={ModalFormText[openModalFormOpenStatus]}
        confirmLoading={confirmLoading}
        onFinish={handleEditData}
        initValues={initValues}
        handleCancel={handleEditModal}
        show={modalShow}
      >
        <Form.Item name="name" label="渠道名称">
          <Input placeholder="请输入" />
        </Form.Item>
        <Form.Item name="status" label="沟通状态">
          <Select
            placeholder="请选择"
            options={Object.values(ChannelInfoListStatusEnum).map((value: string) => ({
              value,
              label: value,
            }))}
          ></Select>
        </Form.Item>
        <Form.Item name="type" label="渠道类型">
          <Select
            placeholder="请选择"
            options={Object.keys(ChannelInfoListTypeEnum).map((value: string) => ({
              value,
              label: ChannelInfoListTypeEnum[value as keyof typeof ChannelInfoListTypeEnum],
            }))}
          ></Select>
        </Form.Item>
        <Form.Item name="contactInfo" label="联系方式">
          <Input placeholder="请输入" />
        </Form.Item>
        <Form.Item name="remark" label="备注">
          <Input.TextArea rows={6} />
        </Form.Item>
      </FormModal>
      <Table<BusinessInfoType>
        scroll={{ x: "max-content" }}
        pagination={{ showSizeChanger: true }}
        rowKey="id"
        onChange={tableChange}
        columns={columns}
        dataSource={dataSource}
      />
    </LocaleWrap>
  );
}
