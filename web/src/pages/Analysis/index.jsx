import React from 'react';
import {PageContainer} from '@ant-design/pro-layout';
import { Row, Col, Tooltip, Icon } from 'antd';
import ChartCard from '../analysis/components/Charts/ChartCard';
import { InfoCircleOutlined } from '@ant-design/icons';

export default () => {
    return (
        <PageContainer>
            <Row gutter={8}>
                <Col sm={16} md={6}>
                    <ChartCard
                        title="Tổng lượt đăng ký"
                        total={'1234'}
                        avatar={
                            <img
                                height={48}
                                width={48}
                                src={require('@/assets/registration.png')}
                            ></img>
                        }
                        action={
                            <Tooltip title="Tổng lượt đăng ký xe">
                                <InfoCircleOutlined />
                            </Tooltip>
                        }
                    ></ChartCard>
                </Col>
                <Col sm={16} md={6}>
                    <ChartCard
                        title="Số lượng người dùng"
                        total={'1234'}
                        avatar={
                            <img
                                height={48}
                                width={48}
                                src={require('@/assets/registrator.png')}
                            ></img>
                        }
                        action={
                            <Tooltip title="Số người sử dụng hệ thống đăng ký xe">
                                <InfoCircleOutlined />
                            </Tooltip>
                        }
                    ></ChartCard>
                </Col>
                <Col sm={16} md={6}>
                    <ChartCard></ChartCard>
                </Col>
                <Col sm={16} md={6}>
                    <ChartCard></ChartCard>
                </Col>
            </Row>
        </PageContainer>
    );
}