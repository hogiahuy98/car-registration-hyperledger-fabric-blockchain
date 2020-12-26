import React, { useState, useEffect } from 'react';
import {
    Card,
    Table,
    Input,
    Row,
    Col,
    Typography,
    Divider,
    Badge,
    Button,
    Select,
    DatePicker,
    Space,
    Modal
} from 'antd';
import { useHistory } from 'umi';
import { PageContainer } from '@ant-design/pro-layout';
import axios from 'axios';
import moment from 'moment';
import { PlusOutlined } from '@ant-design/icons';

moment.locale('en');

const { Search } = Input;
import CityForm from './components/CityForm';

export default () => {
    const [formVisible, setFormVisible] = useState(false);

    return (
        <PageContainer>
            <Card>
                <Row gutter={1}>
                    <Col span={3}>
                        <Select
                            defaultValue="number"
                            placeholder="Tìm kiếm bằng"
                            style={{ width: '100%' }}
                        >
                            <Option value="number">Mã số tỉnh thành</Option>
                            <Option value="name">Tên tỉnh thành</Option>
                        </Select>
                    </Col>
                    <Col span={8}>
                        <Search
                            placeholder="Nội dung tìm kiếm"
                            allowClear
                            enterButton="Tìm kiếm"
                            size="middle"
                        />
                    </Col>
                    <Col offset={5} span={8}>
                        <Space style={{ float: 'right' }}>
                            <Button
                                type="primary"
                                style={{ float: 'right' }}
                                onClick={() => setFormVisible(true)}
                            >
                                <PlusOutlined />
                                Thêm tỉnh, thành
                            </Button>
                        </Space>
                    </Col>
                </Row>
                <Divider></Divider>
                <Table></Table>
            </Card>
            <Modal title="Thêm tỉnh, thành phố" visible={formVisible} footer={null} onCancel={() => setFormVisible(false)}>
                <CityForm />
            </Modal>
        </PageContainer>
    );
};