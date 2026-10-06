import React, { useState } from 'react';
import { App as AntApp, Form, Input, Modal } from 'antd';
import { useAuth } from '../../context/AuthContext';

interface Values {
  current: string;
  next: string;
  next2: string;
}

/** 新密码规则与服务端 validatePassword 一致：至少 10 位，且确认输入一致。 */
export const newPasswordRules = [
  { required: true, message: '请输入新密码' },
  { min: 10, message: '新密码至少 10 位' },
];

export const confirmRules = (field = 'next') => [
  { required: true, message: '请再输入一次新密码' },
  ({ getFieldValue }: { getFieldValue: (name: string) => unknown }) => ({
    validator: (_: unknown, value: string) =>
      !value || getFieldValue(field) === value ? Promise.resolve() : Promise.reject(new Error('两次输入的新密码不一致')),
  }),
];

export const ChangePasswordModal: React.FC<{ open: boolean; onClose: () => void }> = ({ open, onClose }) => {
  const { changePassword } = useAuth();
  const { message } = AntApp.useApp();
  const [form] = Form.useForm<Values>();
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    const v = await form.validateFields();
    setBusy(true);
    try {
      await changePassword(v.current, v.next);
      message.success('密码已修改');
      form.resetFields();
      onClose();
    } catch (e: any) {
      message.error(e.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal
      title="修改密码"
      open={open}
      onCancel={onClose}
      onOk={submit}
      okText="保存"
      confirmLoading={busy}
      destroyOnHidden
      width={420}
    >
      <Form form={form} layout="vertical" requiredMark={false} style={{ paddingTop: 8 }} preserve={false}>
        <Form.Item name="current" label="当前密码" rules={[{ required: true, message: '请输入当前密码' }]}>
          <Input.Password autoComplete="current-password" />
        </Form.Item>
        <Form.Item name="next" label="新密码" rules={newPasswordRules} extra="至少 10 位，不能与邮箱相同">
          <Input.Password autoComplete="new-password" />
        </Form.Item>
        <Form.Item name="next2" label="确认新密码" dependencies={['next']} rules={confirmRules()}>
          <Input.Password autoComplete="new-password" />
        </Form.Item>
      </Form>
    </Modal>
  );
};
