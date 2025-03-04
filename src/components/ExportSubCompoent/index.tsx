'use client';

import React from 'react';
import { Form as AntdForm } from 'antd';
import type { FormItemProps } from 'antd/es/form';

const FormItem = React.forwardRef<HTMLElement, FormItemProps & React.RefAttributes<HTMLElement>>(
  (props, ref) => <AntdForm.Item ref={ref} {...props} />,
);
FormItem.displayName = 'FormItem';
export { FormItem };