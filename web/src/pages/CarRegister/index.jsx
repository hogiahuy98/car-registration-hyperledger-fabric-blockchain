import React, { useContext, useEffect, useState } from 'react';
import { Card, Row, Col, Typography, Spin } from 'antd';
import { PageContainer } from '@ant-design/pro-layout';
import { LoadingOutlined, FormOutlined } from '@ant-design/icons';
import axios from 'axios';
import { history } from 'umi';

import { DEFAULT_HOST } from '@/host';
import CarRegisterForm from './components/CarRegisterForm';
import Description from './components/PendingRegistration';
import { fetchCurrentUser, logout } from '@/helpers/Auth';

const icon = <LoadingOutlined style={{ fontSize: 24 }} spin />;

const mainTitle = <Typography.Text strong><FormOutlined/> Đăng ký xe</Typography.Text>;
const subTitle = <Typography.Text strong>Quy trình đăng ký xe online</Typography.Text>;

export default () => {
    const [spin, setSpin] = useState(true);
    const [pending, setPending] = useState(false);
    const [registration, setRegistration] = useState({});
    const [reload, setReload] = useState(0);

    const auth = fetchCurrentUser();

    useEffect(() => {
        const f = async () => {
            const pendingUrl = `${DEFAULT_HOST}/users/${auth.id}/cars/pending`;
            try {
                const response = await axios.get(pendingUrl, {
                    headers: {
                        Authorization: `Bearer ${auth.token}`,
                    },
                });
                const pendingRegistration = response.data;
                if (pendingRegistration.length === 0 || pendingRegistration.error) {
                    setPending(false);
                    setSpin(false);
                } else {
                    setSpin(false);
                    setPending(true);
                    setRegistration(pendingRegistration);
                }
            } catch (error) {
                setSpin(false);
                setPending(true);
            }
        };
        f();
    }, [reload]);

    return (
        <PageContainer>
            <Row>
                <Col span={12}>
                    <Spin spinning={spin} indicator={icon} style={{ backgroundColor: 'white' }}>
                        {pending ? (
                            <Description
                                reload={() => setReload(reload + 1)}
                                registration={registration}
                            />
                        ) : (
                            <CarRegisterForm
                                reload={() => setReload(reload + 1)}
                                title={mainTitle}
                            />
                        )}
                    </Spin>
                </Col>
                <Col span={12} style={{ paddingLeft: '20px' }}>
                    <Card title={subTitle}>
                        <div
                        >
                            <p>
                                Gồm những bước sau:
                            </p>
                            <p>
                                <strong>
                                    Bước 1: Chủ xe đăng ký tài khoản trên hệ thống
                                </strong>
                            </p>
                            <p>
                                Truy cập trang https://drivechain.vn, click vào "ĐĂNG KÝ" để đăng ký tài khoản. Lưu ý nhập đúng thông tin, khi CSGT xác thực tài khoản 
                                nếu thông tin chủ xe sai quá 30% sẽ bị xóa tài khoản và cấm đăng ký 30 ngày.
                            </p>
                            <p>
                                <strong>
                                    Bước 2: Đăng ký xe lên hệ thống
                                </strong>
                            </p>
                            <p>
                                Chủ xe đăng nhập vào hệ thống, điền đủ thông tin xe lên Form "Đăng ký xe" (Có thể tìm thấy ngay trên trang web sau khi đăng nhập).
                                Click vào đăng ký.
                            </p>
                            <p>
                                Mặc d&ugrave; c&oacute; thể k&ecirc; khai qua mạng nhưng tr&ecirc;n
                                thực tế chủ xe vẫn phải đến cơ quan c&oacute; thẩm quyền để xuất
                                tr&igrave;nh giấy tờ, mang xe đến kiểm tra theo quy định.
                            </p>
                            <p>
                                <strong>Bước 3: Chuẩn bị giấy tờ</strong>
                            </p>
                            Người d&acirc;n c&oacute; nhu cầu đăng k&yacute; xe cần chuẩn bị giấy tờ
                            của xe như sau:
                            <p>- Giấy tờ nguồn gốc xe:</p>
                            <p>
                                + Đối với xe nhập khẩu: Tờ khai nguồn gốc xe &ocirc; t&ocirc;, xe
                                gắn m&aacute;y nhập khẩu/Tờ khai hải quan; Giấy ph&eacute;p nhập
                                khẩu tạm nhập khẩu xe v&agrave; Bi&ecirc;n lai thuế nhập khẩu, thuế
                                ti&ecirc;u thụ đặc biệt, thuế gi&aacute; trị gia tăng h&agrave;ng
                                nhập khẩu hoặc lệnh ghi thu, ghi chi hoặc giấy nộp tiền v&agrave;o
                                ng&acirc;n s&aacute;ch Nh&agrave; nước.
                            </p>
                            <p>
                                Trường hợp miễn thuế: Phải c&oacute; th&ecirc;m quyết định miễn thuế
                                hoặc văn bản cho miễn thuế của cấp c&oacute; thẩm quyền hoặc giấy
                                x&aacute;c nhận h&agrave;ng viện trợ hoặc giấy ph&eacute;p nhập khẩu
                                ghi r&otilde; miễn thuế.
                            </p>
                            <p>
                                Xe thuế suất bằng 0%: Tờ khai h&agrave;ng ho&aacute; xuất, nhập khẩu
                                phi mậu dịch theo quy định trong đ&oacute; phải ghi nh&atilde;n hiệu
                                xe v&agrave; số m&aacute;y, số khung.
                            </p>
                            <p>
                                Xe nhập khẩu theo chế độ tạm nhập, t&aacute;i xuất của c&aacute;c
                                đối tượng được hưởng quyền ưu đ&atilde;i miễn trừ ngoại giao, xe của
                                chuy&ecirc;n gia nước ngo&agrave;i thực hiện chương tr&igrave;nh dự
                                &aacute;n ODA ở Việt Nam, người Việt Nam định cư ở nước ngo&agrave;i
                                được mời về nước l&agrave;m việc: Tờ khai hải quan theo quy định
                                v&agrave; Giấy ph&eacute;p nhập khẩu, tạm nhập khẩu xe.
                            </p>
                            <p>
                                + Đối với xe sản xuất, lắp r&aacute;p trong nước: Phiếu kiểm tra
                                chất lượng xuất xưởng phương tiện giao th&ocirc;ng cơ giới đường bộ
                                theo quy định.
                            </p>
                            <p>
                                + Đối với xe cải tạo: Giấy chứng nhận đăng k&yacute; xe hoặc giấy tờ
                                nguồn gốc nhập khẩu; Giấy chứng nhận chất lượng an to&agrave;n kỹ
                                thuật v&agrave; bảo vệ m&ocirc;i trường xe cơ giới cải tạo.
                            </p>
                            <p>
                                + Đối với xe nguồn gốc tịch thu sung quỹ Nh&agrave; nước: Quyết định
                                về việc tịch thu phương tiện hoặc Quyết định về việc x&aacute;c lập
                                quyền sở hữu to&agrave;n d&acirc;n đối với phương tiện hoặc
                                Tr&iacute;ch lục Bản &aacute;n nội dung tịch thu phương tiện, ghi
                                đầy đủ c&aacute;c đặc điểm của xe: Nh&atilde;n hiệu, số loại, loại
                                xe, số m&aacute;y, số khung, dung t&iacute;ch xi lanh, năm sản xuất
                                (đối với xe &ocirc; t&ocirc;).
                            </p>
                            <p>
                                Ho&aacute; đơn b&aacute;n t&agrave;i sản tịch thu, sung quỹ
                                Nh&agrave; nước hoặc h&oacute;a đơn b&aacute;n t&agrave;i sản
                                c&ocirc;ng hoặc h&oacute;a đơn b&aacute;n t&agrave;i sản Nh&agrave;
                                nước (xử l&yacute; t&agrave;i sản theo h&igrave;nh thức b&aacute;n
                                đấu gi&aacute;); bi&ecirc;n bản b&agrave;n giao tiếp nhận t&agrave;i
                                sản (xử l&yacute; t&agrave;i sản theo h&igrave;nh thức điều chuyển);
                                Phiếu thu tiền hoặc giấy bi&ecirc;n nhận tiền hoặc bi&ecirc;n bản
                                b&agrave;n giao (nếu l&agrave; người bị hại).
                                <br />
                                &nbsp;
                            </p>
                            <p>
                                - Giấy tờ chuyển quyền sở hữu xe, gồm một trong c&aacute;c giấy tờ
                                sau đ&acirc;y:
                            </p>
                            <p>
                                + Ho&aacute; đơn, chứng từ t&agrave;i ch&iacute;nh (bi&ecirc;n lai,
                                phiếu thu) hoặc giấy tờ mua b&aacute;n, cho, tặng xe (quyết định,
                                hợp đồng, văn bản thừa kế);
                            </p>
                            <p>
                                + Giấy b&aacute;n, cho, tặng xe của c&aacute; nh&acirc;n c&oacute;
                                x&aacute;c nhận c&ocirc;ng chứng hoặc chứng thực hoặc x&aacute;c
                                nhận của cơ quan, tổ chức, đơn vị đang c&ocirc;ng t&aacute;c đối với
                                lực lượng vũ trang v&agrave; người nước ngo&agrave;i l&agrave;m việc
                                trong cơ quan đại diện ngoại giao, cơ quan l&atilde;nh sự, cơ quan
                                đại diện của tổ chức quốc tế m&agrave; đăng k&yacute; xe theo địa
                                chỉ của cơ quan, tổ chức, đơn vị c&ocirc;ng t&aacute;c;
                            </p>
                            <p>
                                + Đối với xe c&ocirc;ng an thanh l&yacute;: Quyết định thanh
                                l&yacute; xe của cấp c&oacute; thẩm quyền v&agrave; h&oacute;a đơn
                                b&aacute;n t&agrave;i sản c&ocirc;ng hoặc h&oacute;a đơn b&aacute;n
                                t&agrave;i sản Nh&agrave; nước;
                            </p>
                            <p>
                                + Đối với xe qu&acirc;n đội thanh l&yacute;: Giấy chứng nhận đăng
                                k&yacute; xe, c&ocirc;ng văn x&aacute;c nhận xe đ&atilde; được loại
                                khỏi trang bị qu&acirc;n sự của Cục Xe - m&aacute;y, Bộ Quốc
                                ph&ograve;ng v&agrave; h&oacute;a đơn b&aacute;n t&agrave;i sản
                                c&ocirc;ng hoặc h&oacute;a đơn b&aacute;n t&agrave;i sản Nh&agrave;
                                nước.
                            </p>
                            <p>- Giấy tờ lệ ph&iacute; trước bạ xe:</p>
                            <p>
                                + Bi&ecirc;n lai hoặc Giấy nộp tiền v&agrave;o ng&acirc;n
                                s&aacute;ch Nh&agrave; nước hoặc giấy ủy nhiệm chi qua ng&acirc;n
                                h&agrave;ng nộp lệ ph&iacute; trước bạ hoặc giấy tờ nộp lệ
                                ph&iacute; trước bạ kh&aacute;c hoặc giấy th&ocirc;ng tin dữ liệu
                                nộp lệ ph&iacute; trước bạ được in từ hệ thống đăng k&yacute; quản
                                l&yacute; xe (ghi đầy đủ nh&atilde;n hiệu, số loại, loại xe, số
                                m&aacute;y, số khung của xe). Trường hợp nhiều xe chung một giấy tờ
                                lệ ph&iacute; trước bạ th&igrave; mỗi xe đều phải c&oacute; bản sao
                                chứng thực theo quy định hoặc x&aacute;c nhận của cơ quan đ&atilde;
                                cấp giấy tờ lệ ph&iacute; trước bạ đ&oacute;;
                            </p>
                            <p>
                                + Xe được miễn lệ ph&iacute; trước bạ: Tờ khai lệ ph&iacute; trước
                                bạ c&oacute; x&aacute;c nhận của cơ quan thuế.
                            </p>
                            <p>
                                Chủ xe xuất tr&igrave;nh giấy tờ của chủ xe như Chứng minh
                                nh&acirc;n d&acirc;n/Căn cước c&ocirc;ng d&acirc;n/Hộ chiếu&hellip;
                            </p>
                            <p>
                                <strong>
                                    Bước 4: Mang xe v&agrave; giấy tờ đến trực tiếp cơ quan đăng
                                    k&yacute; xe{' '}
                                </strong>
                            </p>
                            <p>
                                Theo Điều 6 Th&ocirc;ng tư 58, chủ xe phải đưa xe đến cơ quan đăng
                                k&yacute; xe để kiểm tra đối với xe đăng k&yacute; lần đầu.
                                C&aacute;n bộ, chiến sĩ l&agrave;m nhiệm vụ đăng k&yacute; xe kiểm
                                tra hồ sơ v&agrave; thực tế xe đầy đủ đ&uacute;ng quy định, sau
                                đ&oacute; hướng dẫn chủ xe bấm chọn biển số tr&ecirc;n hệ thống đăng
                                k&yacute; xe.
                            </p>
                            <p>
                                <strong>
                                    Bước 5: Chủ xe nhận giấy hẹn trả giấy chứng nhận đăng k&yacute;
                                    xe, nộp lệ ph&iacute; đăng k&yacute; xe v&agrave; nhận biển số
                                </strong>
                            </p>
                            <p>
                                Sau khi kiểm tra hồ sơ v&agrave; thực tế xe, c&aacute;n bộ, chiến sĩ
                                l&agrave;m nhiệm vụ đăng k&yacute; xe ho&agrave;n thiện hồ sơ
                                v&agrave; cấp Giấy chứng nhận đăng k&yacute; xe.
                            </p>
                            <p>
                                Biển số xe được cấp ngay sau khi nhận hồ sơ hợp lệ. Giấy chứng nhận
                                đăng k&yacute; xe được cấp sau kh&ocirc;ng qu&aacute; 02 ng&agrave;y
                                l&agrave;m việc, kể từ ng&agrave;y nhận đủ hồ sơ hợp lệ.
                            </p>
                        </div>
                    </Card>
                </Col>
            </Row>
        </PageContainer>
    );
};
