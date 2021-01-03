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
    Modal,
    Tag
} from 'antd';
import { useHistory } from 'umi';
import { PageContainer } from '@ant-design/pro-layout';
import axios from 'axios';
import moment from 'moment';
import { PlusOutlined } from '@ant-design/icons';
import {fetchCurrentUser} from '@/helpers/Auth'
import { DEFAULT_HOST } from '@/host';


moment.locale('en');

const { Search } = Input;
import CityForm from './components/CityForm';

export default () => {
    const [formVisible, setFormVisible] = useState(false);
    const [cityData, setCityData] = useState([]);
    const [editCity, setEditCity] = useState({
        visible: false,
    });
    const [tloading, setTloading] = useState(true);
    const user = fetchCurrentUser();
    const config = {
        headers: {
            Authorization: 'Bearer ' + user.token,
        },
    };

    useEffect(() => {
        const f = async () => {
            const citys = await fetchCity();
            setCityData(citys);
            setTloading(false);
        };
        f();
    }, [editCity, formVisible]);

    const fetchCity = async () => {
        try {
            setTloading(true);
            const url = DEFAULT_HOST + '/city';
            const result = await axios.get(url, config);
            return result.data;
        } catch (error) {
            console.log(error);
        }
    };

    const columns = [
        {
            title: 'Tên tỉnh, thành',
            key: 'name',
            dataIndex: 'name',
        },
        {
            title: 'Số hiệu biển số',
            key: 'number',
            dataIndex: 'number',
            render: (text, record) => {
                return record.number.map((num) => {
                    return <Tag>{num}</Tag>;
                });
            },
        },
        {
            title: 'Chỉnh sửa',
            render: (text, record) => {
                return <Button type="link" onClick={() => setEditCity({visible: true, city: record})}>Chỉnh sửa</Button>;
            },
        },
    ];

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
                <Table loading={tloading} dataSource={cityData} columns={columns}></Table>
            </Card>
            <Modal
                centered
                title="Thêm tỉnh, thành phố"
                visible={formVisible}
                footer={null}
                onCancel={() => setFormVisible(false)}
                destroyOnClose
            >
                <CityForm disable={() => setFormVisible(false)} />
            </Modal>
            <Modal
                centered
                title="Chỉnh sửa tỉnh, thành phố"
                visible={editCity.visible}
                footer={null}
                onCancel={() => setEditCity({ ...editCity, visible: false })}
                destroyOnClose
            >
                <CityForm disable={()=> setEditCity(false)} edit={editCity.city} />
            </Modal>
        </PageContainer>
    );
};