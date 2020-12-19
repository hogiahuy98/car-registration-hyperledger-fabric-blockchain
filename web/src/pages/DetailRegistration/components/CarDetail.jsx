import React from 'react';
import {Descriptions, Typography} from 'antd';
import {DESCRIPTION_LABEL} from './Constants';
import moment from 'moment';

export default ({car}) => {
    console.log(car)
    return (
            <Descriptions column={2} bordered>
                <Descriptions.Item label={DESCRIPTION_LABEL.REGISTRATION_DATE}>
                    Ngày {moment(car.registrationTime).format("D/MM/YYYY, hh:mm:ss")}
                </Descriptions.Item>
                <Descriptions.Item label={DESCRIPTION_LABEL.BRAND}>
                    {car.brand}
                </Descriptions.Item>
                <Descriptions.Item label={DESCRIPTION_LABEL.MODEL}>
                    {car.model}
                </Descriptions.Item>
                <Descriptions.Item label={DESCRIPTION_LABEL.COLOR}>
                    {car.color}
                </Descriptions.Item>
                <Descriptions.Item label={DESCRIPTION_LABEL.YEAR}>
                    {car.year}
                </Descriptions.Item>
                <Descriptions.Item label={DESCRIPTION_LABEL.CAPALITY}>
                    {car.capality}
                </Descriptions.Item>
                <Descriptions.Item label={DESCRIPTION_LABEL.CHASSIS_NUMBER}>
                    {car.chassisNumber}
                </Descriptions.Item>
                <Descriptions.Item label={DESCRIPTION_LABEL.ENGINE_NUMBER}>
                    {car.engineNumber}
                </Descriptions.Item>
                <Descriptions.Item label="Biển số xe" span={1} >
                    <Typography.Text aria-label='center'> {car.registrationNumber}</Typography.Text>
                </Descriptions.Item>
            </Descriptions>
    )
}