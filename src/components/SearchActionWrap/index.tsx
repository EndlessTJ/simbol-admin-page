import { Col, Row } from 'antd';
import React, { FC } from 'react';
import styles from './index.module.scss';

type SearchActionWrapProps = {
  gutter?: [number, number];
  justify?: "center" | "start" | "end" | "space-around" | "space-between" | "space-evenly";
  children?: React.ReactNode
}

 const SearchActionWrap: FC<SearchActionWrapProps> = ({gutter = [16, 16], justify = "end", children, ...props}) => {
  return (
    <Row className={styles.contorlwrap} gutter={gutter} justify={justify} {...props} >
    <Col>
     {children}
    </Col>
  </Row>
  )
}

export default SearchActionWrap;