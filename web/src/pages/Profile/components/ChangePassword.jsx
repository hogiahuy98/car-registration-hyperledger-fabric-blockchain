import React, {useState} from 'react';
import {Modal, Form, Input, Button} from 'antd';
import axios from 'axios';
import { fetchCurrentUser } from '@/helpers/Auth';
import { DEFAULT_HOST } from '@/host';

export default () => {
    const [password, setPassword] = useState('');
    const user = fetchCurrentUser();
    const config = {
        header: {
            Authorization: 'Bearer ' + user.token,
        },
    };
    const handleFormFinish = (value) => {
        const url = DEFAULT_HOST + 'users/me/changePassword';
        
    };

    return (
        <Form labelCol={{ span: 8 }} wrapperCol={{ span: 8 }}>
            <Form.Item label="Mật khẩu cũ">
                <Input type="password"></Input>
            </Form.Item>
            <Form.Item label="Mật khẩu mới" name='password'>
                <Input type="password" onChange={(e) => setPassword(e.target.value)}></Input>
            </Form.Item>
            <Form.Item
                name='repassword'
                hasFeedback
                label="Nhập lại mật khẩu mới"
                rules={[
                    {
                        validator: async (rule, value) => {
                            if (value !== password) throw 'Mật khẩu không khớp';
                            return;
                        },
                    },
                    { required: true, message: 'CC' },
                ]}
            >
                <Input type="password"></Input>
            </Form.Item>
            <Form.Item wrapperCol={{ offset: 8 }}>
                <Button htmlType="submit" type="primary">
                    Đổi mật khẩu
                </Button>
            </Form.Item>
        </Form>
    );
};