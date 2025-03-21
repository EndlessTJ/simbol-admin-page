import locale from 'antd/locale/zh_CN';
import { ConfigProvider } from 'antd';
import { FC } from 'react';
import dayjs from 'dayjs';

import 'dayjs/locale/zh-cn';


dayjs.locale('zh-cn');
interface LocaleWrapProps {
  locale?: string;
  children: React.ReactNode;
}

const LocaleWrap: FC<LocaleWrapProps> = ({ children }) => (
  <ConfigProvider locale={locale}>
    {children}
  </ConfigProvider>
);

export default LocaleWrap;
