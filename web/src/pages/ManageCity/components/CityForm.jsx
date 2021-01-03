import React, { useState, useEffect } from 'react';
import { Form, Select, Input, Button, Checkbox, Space, Card, Typography, Divider, Radio, message} from 'antd';
import { PlusOutlined, CloseCircleOutlined } from '@ant-design/icons';
import axios from 'axios';
import { DEFAULT_HOST } from '@/host';
import {fetchCurrentUser} from '@/helpers/Auth'

const useForm = Form.useForm;

export default ({edit, disable}) => {
    const [numbers, setNumbers] = useState([]);
    const [series, setSeries] = useState([]);
    const [loading, setLoading] = useState(false);
    const [districts, setDistricts] = useState([])
    const user = fetchCurrentUser();
    const config = {
        headers: {
            Authorization: 'Bearer ' + user.token,
        }
    }
    const [form] = useForm();

    useEffect(() => {
        const f = async () => {
            const formData = {};
            formData.city = edit;
            setNumbers(edit.number);
            setSeries(edit.series);
            const districts = await fetchDistrict(edit.id);
            formData.districts = districts;
            setDistricts(districts)
            form.setFieldsValue(formData);
        }
        if(edit) {
            f();
        }
    }, [edit]);

    const fetchDistrict = async (cityId) => {
        try {
            const url = DEFAULT_HOST + '/city/' + cityId + '/district';
            const result = await axios.get(url, config);
            return result.data;
        } catch (error) {
            console.log(error);
        }
    }

    const formFinish = async (value) => {
        setLoading(true);
        const url = DEFAULT_HOST + '/city';
        let mess;
        if(edit) {
            const updateVa = updateValue(value);
            try {
                const result =  await axios.put(url,updateVa, config);       
                mess = "Thành công";        
            } catch (error) {
                console.log(error);
                mess = "Thất bại"
            }
        }
        else {
            try {
                const result =  await axios.post(url,value, config);
                mess = "Thành công"              
            } catch (error) {
                console.log(error);
                mess = "Thất bại"
            }
        }
        message.success(mess);
        disable();
    }

    const updateValue = (value) =>{
        const result = {}
        console.log(edit);
        result.city = {...edit, ...value.city};
        result.districts = value.districts.map((district, index) => {
            return {
                ...districts[index], ...district
            }
        })
        return result;
    }

    const isAlreadyAxistNumber = async (number) => {
        const url = DEFAULT_HOST + '/city?number=' + number + (edit ? "&id=" + edit.id : null);
        const result = await axios.get(url, config);
        if (result.data.length > 0) return true;
        return false;
    }
    async function filter(arr, callback) {
        const fail = Symbol()
        return (await Promise.all(arr.map(async item => (await callback(item)) ? item : fail))).filter(i=>i!==fail)
      }

    return (
        <Form
            labelCol={{ span: 8 }}
            labelAlign="left"
            name="city"
            onFinish={formFinish}
            form={form}
        >
            <Form.Item name={['city', 'name']} label="Tên tỉnh, thành phố">
                <Input disabled={loading} placeholder="Ví dụ:Cần Thơ..."></Input>
            </Form.Item>
            <Form.Item
                name={['city', 'number']}
                label="Ký hiệu biển số"
                rules={[
                    {
                        validator: async (rule, numbers) => {
                            const existNumbers = await filter(numbers, async (number) => {
                                return await isAlreadyAxistNumber(number);
                            });
                            console.log(existNumbers);
                            if (existNumbers.length > 0) {
                                const mess = existNumbers.reduce((mess, num) => mess + ', ' + num);
                                throw `Số ${mess} đã được sử dụng`;
                            }
                        },
                    },
                ]}
            >
                <Select
                    disabled={loading}
                    mode="tags"
                    placeholder="Ví dụ:65..."
                    notFoundContent={null}
                    onChange={setNumbers}
                ></Select>
            </Form.Item>
            <Form.Item name={['city', 'series']} label="Seri biển số">
                <Select
                    disabled={loading}
                    mode="tags"
                    placeholder="Ví dụ: A, B, F..."
                    notFoundContent={null}
                    onChange={setSeries}
                ></Select>
            </Form.Item>
            <Form.List name="districts">
                {(fields, { add, remove }) => (
                    <>
                        {fields.map((field) => (
                            <>
                                <Card>
                                    <Form.Item
                                        {...field}
                                        name={[field.name, 'districtName']}
                                        rules={[{ required: true, message: 'Nhập tên quận/huyện' }]}
                                        wrapperCol={{ span: 24 }}
                                    >
                                        <Input disabled={loading} placeholder="Tên quận, huyện" />
                                    </Form.Item>
                                    <Form.Item
                                        {...field}
                                        name={[field.name, 'headquartersAddress']}
                                        rules={[{ required: true, message: 'Nhập địa chỉ trụ sở' }]}
                                        wrapperCol={{ span: 24 }}
                                        style={{ width: '100%' }}
                                    >
                                        <Input disabled={loading} placeholder="Địa chỉ trụ sở" />
                                    </Form.Item>
                                    <Form.Item
                                        label="Số hiệu"
                                        name={[field.name, 'numberIndex']}
                                        initialValue={
                                            districts.length > 0 && field.key < districts.length
                                                ? districts[field.key].numberIndex
                                                : 0
                                        }
                                    >
                                        <Radio.Group
                                            disabled={loading}
                                            defaultValue={
                                                districts.length > 0 && field.key < districts.length
                                                    ? districts[field.key].numberIndex
                                                    : 0
                                            }
                                            value={
                                                districts.length > 0&& field.key < districts.length
                                                    ? districts[field.key].numberIndex
                                                    : 0
                                            }
                                            optionType="button"
                                            buttonStyle="solid"
                                        >
                                            {numbers.map((number, index) => {
                                                return (
                                                    <Radio.Button value={index}>
                                                        {number}
                                                    </Radio.Button>
                                                );
                                            })}
                                        </Radio.Group>
                                    </Form.Item>
                                    <Form.Item
                                        {...field}
                                        name={[field.name, 'seriesIndex']}
                                        label="Seri"
                                        initialValue={
                                            districts.length > 0 && field.key < districts.length
                                                ? districts[field.key].seriesIndex
                                                : 0
                                        }
                                    >
                                        <Radio.Group
                                            disabled={loading}
                                            defaultValue={
                                                districts.length > 0 && field.key < districts.length
                                                    ? districts[field.key].seriesIndex
                                                    : 0
                                            }
                                            value={
                                                districts.length > 0 && field.key < districts.length
                                                    ? districts[field.key].seriesIndex
                                                    : 0
                                            }
                                            optionType="button"
                                            buttonStyle="solid"
                                            options={series.map((seri, index) => {
                                                return {
                                                    label: seri,
                                                    value: index,
                                                };
                                            })}
                                        ></Radio.Group>
                                    </Form.Item>
                                    {edit?null:<Form.Item wrapperCol={{ offset: 11 }}>
                                        <Button
                                            shape="circle"
                                            onClick={() => remove(field.name)}
                                            disabled={loading}
                                        >
                                            <CloseCircleOutlined />
                                        </Button>
                                    </Form.Item>}
                                </Card>
                            </>
                        ))}
                        <Form.Item>
                            <Button
                                type="dashed"
                                onClick={() => add()}
                                block
                                icon={<PlusOutlined />}
                            >
                                Thêm quận, huyện
                            </Button>
                        </Form.Item>
                    </>
                )}
            </Form.List>
            {edit ? (
                <Form.Item wrapperCol={{ offset: 8 }}>
                    <Button type="primary" htmlType="submit" loading={loading}>
                        Sửa tỉnh, thành
                    </Button>
                </Form.Item>
            ) : (
                <Form.Item wrapperCol={{ offset: 8 }}>
                    <Button type="primary" htmlType="submit" loading={loading}>
                        Thêm tỉnh, thành
                    </Button>
                </Form.Item>
            )}
        </Form>
    );
};
