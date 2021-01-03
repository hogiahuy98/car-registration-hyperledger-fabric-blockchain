import React, { useContext, useEffect, useState } from 'react';
import { Card, Form, Input, DatePicker, InputNumber, Button, Result, Modal, Space, Select } from 'antd';
import { DEFAULT_HOST } from '@/host';
import axios from 'axios';
import { REGISTRATION_FIELD } from './Constants'

import { fetchCurrentUser, logout } from '@/helpers/Auth';


export default (props) => {
    const [successModalVisible, setSucessModalVisible] = useState(false);
    const [ cities, setCities] = useState([]);
    const [districts, setDistricts] = useState([]);
    const [tx, setTx] = useState({});
    const [posting, setPosting] = useState(false);
    const [cityPicked, setCityPicked] = useState(false);
    const { reload } = props;
    const auth = fetchCurrentUser()
    const config = {
        headers: {
            Authorization: `Bearer ${auth.token}`,
        },
    };

    useEffect(() => {
        const f = async () => {
            setCities(await getCity());
        }
        f();
    }, [])


    const getCity = async () => {
        try {
            const url = DEFAULT_HOST + '/city';
            const result = await axios.get(url, config);
            return result.data;
        } catch (error) {
            console.log(error);
        }
    };

    const fetchDistrict = async (cityId) => {
        try {
            const url = DEFAULT_HOST + `/city/${cityId}/district`;
            const result = await axios.get(url, config);
            console.log(result.data);
            setDistricts(result.data);
        } catch (error) {
            console.log(error);
        }
    };


    const formFinish = async (values) => {
        const url = `${DEFAULT_HOST}/cars/`;
        values.year = values.year.year();
        try {
            const result = await axios.post(url, values, config);
            setPosting(false);
            if (result.data.success && result.data.result.TxID) {
                console.log(result.data)
                await setTimeout(()=> setTx(result.data.result, 3000));
                setSucessModalVisible(true);
            }
        } catch (error) {
            console.log(error);
        }
    };

    const checkChassisNumber = async (rule, chassisNumber) => {
        try {
            const url = `${DEFAULT_HOST}/cars/checkChassisNumber?cn=${chassisNumber}`;
            const result = await axios.get(url, config);
            if (!result.data.valid) throw new Error('69');
        } catch (error) {
            if (error.message === '69') throw 'Số khung đã được đăng ký';
        }
    };

    const checkEngineNumber = async (rule, engineNumber) => {
        try {
            const url = `${DEFAULT_HOST}/cars/checkEngineNumber?en=${engineNumber}`;
            const result = await axios.get(url, config);
            if (!result.data.valid) throw new Error('69');
        } catch (error) {
            if (error.message === '69') throw 'Số máy đã được đăng ký';
        }
    };

    return (
        <Card title={props.title}>
            <Form
                autoComplete="off"
                labelAlign="left"
                labelCol={{ span: 6 }}
                wrapperCol={{ span: 18 }}
                onFinish={formFinish}
                onFinishFailed={() => setPosting(false)}
            >
                <Form.Item
                    label={REGISTRATION_FIELD.BRAND.LABEL}
                    name={REGISTRATION_FIELD.BRAND.NAME}
                    rules={[{ required: true, message: 'Hãng sản xuất không được bỏ trống' }]}
                >
                    <Input disabled={posting} placeholder="VD: Vinfast..." />
                </Form.Item>
                <Form.Item
                    label={REGISTRATION_FIELD.MODEL.LABEL}
                    name={REGISTRATION_FIELD.MODEL.NAME}
                    rules={[{ required: true, message: 'Mẫu không được bỏ trống' }]}
                >
                    <Input disabled={posting} placeholder="VD: Lux SA2.0" />
                </Form.Item>
                <Form.Item
                    label={REGISTRATION_FIELD.COLOR.LABEL}
                    name={REGISTRATION_FIELD.COLOR.NAME}
                    rules={[{ required: true, message: 'Màu sơn không được bỏ trống' }]}
                >
                    <Input disabled={posting} placeholder="VD: Đen, Xám..." />
                </Form.Item>
                <Form.Item
                    label={REGISTRATION_FIELD.YEAR.LABEL}
                    name={REGISTRATION_FIELD.YEAR.NAME}
                    rules={[{ required: true, message: 'Chọn năm sản xuất' }]}
                >
                    <DatePicker disabled={posting} picker="year" placeholder="Chọn năm" />
                </Form.Item>
                <Form.Item
                    label={REGISTRATION_FIELD.CAPALITY.LABEL}
                    name={REGISTRATION_FIELD.CAPALITY.NAME}
                    rules={[
                        { required: true, message: 'Nhập dung tích xe' },
                        { type: 'number', message: 'Dung tích không hợp lệ' },
                    ]}
                >
                    <InputNumber disabled={posting} />
                </Form.Item>
                <Form.Item
                    name="registrationCity"
                    label="Tỉnh, thành đăng ký"
                    rules={[{ required: true, message: 'Vui lòng chọn tỉnh, thành đăng ký' }]}
                    wrapperCol={{span:8}}
                >
                    <Select
                        options={cities.map((city) => {
                            return {
                                label: city.name,
                                value: city.id,
                            };
                        })}
                        onSelect={(value) => {
                            fetchDistrict(value);
                            setCityPicked(true);
                        }}
                    ></Select>
                </Form.Item>
                <Form.Item
                    name="registrationDistrict"
                    label="Quận, huyện"
                    rules={[{ required: true, message: 'Vui lòng chọn quận, huyện đăng ký' }]}
                    wrapperCol={{span:8}}
                >
                    <Select
                        disabled={!cityPicked}
                        options={districts.map((district) => {
                            return {
                                label: district.districtName,
                                value: district.id,
                            };
                        })}
                    ></Select>
                </Form.Item>
                <Form.Item
                    label={REGISTRATION_FIELD.CHASSIS_NUMBER.LABEL}
                    name={REGISTRATION_FIELD.CHASSIS_NUMBER.NAME}
                    hasFeedback
                    rules={[
                        { validator: checkChassisNumber },
                        { required: true, message: 'Nhập số khung' },
                    ]}
                >
                    <Input disabled={posting} placeholder="Số khung" />
                </Form.Item>
                <Form.Item
                    label={REGISTRATION_FIELD.ENGINE_NUMBER.LABEL}
                    name={REGISTRATION_FIELD.ENGINE_NUMBER.NAME}
                    hasFeedback
                    rules={[
                        { validator: checkEngineNumber },
                        { required: true, message: 'Nhập số máy' },
                    ]}
                >
                    <Input disabled={posting} placeholder="Số máy" />
                </Form.Item>
                <Form.Item wrapperCol={{ offset: 6, span: 6 }}>
                    <Button
                        style={{ width: '100%', overflow: 'visible' }}
                        htmlType="submit"
                        type="primary"
                        loading={posting}
                        onClick={() => setPosting(true)}
                    >
                        Đăng ký
                    </Button>
                </Form.Item>
            </Form>
            <Modal
                visible={successModalVisible}
                onCancel={() => {
                    setSucessModalVisible(false);
                    reload();
                }}
                footer={null}
            >
                <Result
                    status="success"
                    title="Đăng ký thành công"
                    subTitle={'Mã đăng ký: ' + tx.regId}
                ></Result>
            </Modal>
        </Card>
    );
};
