import React from 'react';
import { Modal, Steps } from 'antd';
import { IdcardFilled,AuditOutlined, CheckCircleFilled, CheckOutlined } from '@ant-design/icons';
import { useState } from 'react';

import Success from './Success';
import OwnerForm from './OwnerInfomation'
import RegFrom from './CarRegisterForm';
import { useEffect } from 'react';

const { Step } = Steps;

const step = {
    check: 'Kiểm tra xe',
    generateNumber: 'Kiểm tra thông tin người đăng ký',
    complete: 'Hoàn thành',
};


export default ({ visible, disable, registration }) => {
    const [currentTitle, setCurrentTitle] = useState(step.check);
    const [currentStep, setCurrentStep] = useState(0);


    const nextStep = () => {
        setCurrentStep(currentStep + 1);
    }

    const content = () => {
        if (currentStep === 0) return <RegFrom disable={disable} registration={registration} nextStep={nextStep}></RegFrom>;
        if (currentStep === 1) return <OwnerForm disable={disable} registrationId={registration.id} owner={registration.owner} nextStep={nextStep}></OwnerForm>;
        if (currentStep === 2) return <Success regId={registration.id}/>
    }

    return (
        <Modal
            afterClose={() => setCurrentStep(0)}
            onCancel={() => disable()}
            visible={visible}
            width={800}
            title={currentTitle}
            footer={null}
            style={{ top: 20 }}
            destroyOnClose={true}
        >
            <Steps style={{ paddingLeft: '40px', paddingRight: '40px', paddingTop:'20px'}} current={currentStep}>
                <Step icon={<AuditOutlined />} title="Kiểm tra xe"></Step>
                <Step icon={<IdcardFilled />} title="Kiểm tra thông tin chủ sở hữu"></Step>
                <Step icon={<CheckCircleFilled />} title="Hoàn tất"></Step>
            </Steps>
            {content()}
        </Modal>
    );
};
