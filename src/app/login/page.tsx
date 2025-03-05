"use client";
import { Button, Form, Input, message } from "antd";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { requestPost } from "@/lib/api-client";
import styles from "./index.module.scss";

type FieldType = {
  username?: string;
  password?: string;
};

export default function Login() {
  const router = useRouter();
  const [form] = Form.useForm();

  const onFinish = async (values: FieldType) => {
    console.log(values);
    try {
      await requestPost("/auth/login", values);
 
      message.success("登录成功");
      router.push("/main");
    } catch (error) {
      throw error;
    }

  };
  return (
    <div
      className={`${styles.login} flex min-h-full flex-col justify-center px-6 py-12 lg:px-8`}
    >
      <Image
        // className="mx-auto h-10 w-auto"
        src="/img/logo.png"
        alt="logo"
        width={100}
        height={100}
      />
      <div className="sm:mx-auto sm:w-full sm:max-w-sm">
        <h2 className="mt-20 text-center text-2xl/9 font-bold tracking-tight text-gray-900">
          欢迎登陆后台管理系统
        </h2>
      </div>
      <div
        className={`${styles.login_form} mt-10 sm:mx-auto sm:w-full sm:max-w-sm`}
      >
        <Form
          // {...layout}
          layout="vertical"
          form={form}
          className="space-y-6"
          name="login-form"
          onFinish={onFinish}
          // style={{ maxWidth: 600 }}
        >
          <Form.Item
            name="username"
            label="用户名"
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>
          <Form.Item<FieldType>
            label="密码"
            name="password"
            rules={[{ required: true, message: "Please input your password!" }]}
          >
            <Input.Password />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              登陆
            </Button>
          </Form.Item>
        </Form>
      </div>

      <Image
        src="/img/login-bg1.jpg"
        // placeholder="blur"
        priority
        className="blur-[4px]"
        quality={100}
        fill
        sizes="100vw"
        style={{
          objectFit: "cover",
          zIndex: -1,
        }}
        alt={"bg"}
      />
    </div>
  );
}
