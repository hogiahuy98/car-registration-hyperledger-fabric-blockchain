import React, {useState, useEffect} from 'react';
import {Form, Select, Input, Button, Checkbox} from 'antd';
import axios from 'axios';


export default () => {
    return (
        <Form labelCol={{span: 8}} labelAlign='left' onFieldsChange={(changedFields, allFields) => {console.log(changedFields)}}>
            <Form.Item name='name' label="Tên tỉnh, thành phố">
                <Input placeholder='Ví dụ:Cần Thơ...'></Input>
            </Form.Item>
            <Form.Item name='number' label="Ký hiệu tỉnh, thành">
                <Select mode='tags' placeholder='Ví dụ:65...' notFoundContent={null}></Select>
            </Form.Item>
            <Form.Item name='series' label="Seri biển số">
                <Select mode='tags' placeholder='Ví dụ: A, B, F...' notFoundContent={null}></Select>
            </Form.Item>
        </Form>
    )
}