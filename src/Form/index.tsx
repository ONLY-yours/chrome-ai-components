import React, { useEffect, useMemo, useState, type FC } from 'react';

import { OpenAIOutlined } from '@ant-design/icons';
import { CoreMessage, streamObject } from 'ai';
import { Button, Form, FormProps, Input, Space } from 'antd';
import {
  useSettingsForm,
  useSettingsModel,
} from 'chrome-ai-components/utils/settings';
import { z } from 'zod';

type AIFormProps = {
  description?: string;
} & FormProps;

type MagicInputProps = {
  value: string;
  onChange: (value: string) => void;
  onGenerate: () => void;
  onLoading?: boolean;
};

const MagicInput: FC<MagicInputProps> = (props) => {
  const { value, onChange, onGenerate, onLoading = false } = props;
  return (
    <Form.Item label="AI Input" name="ai-description">
      <Space>
        <Form.Item noStyle>
          <Input.TextArea
            value={value}
            style={{
              height: 16,
            }}
            onChange={(e) => onChange(e.target.value)}
          />
        </Form.Item>
        <Button
          onClick={() => onGenerate()}
          loading={onLoading}
          type="primary"
          icon={<OpenAIOutlined />}
        />
      </Space>
    </Form.Item>
  );
};

const AIForm: FC<AIFormProps> = (props) => {
  const { form, children, ...rest } = props;
  const [linkRef, setLinkRef] = useState(form);
  const [aiFormSchema, setAiFormSchema] = useState<object>({});

  const [messageLoading, setLoading] = useState(false);

  const [aiFormDescription, setAiFormDescription] = useState('');

  const settingsForm = useSettingsForm({
    temperature: 0,
    topK: 3,
    content: '',
  });

  const model = useSettingsModel(settingsForm);

  const schema = useMemo(() => {
    return z.object({
      name: z.string({ description: 'Name' }),
      address: z.string({ description: 'Address' }),
      phone: z.string({ description: 'Phone Number' }),
    });
  }, [linkRef]);

  const messages = useMemo(() => {
    const content =
      aiFormDescription ||
      `
   Jeason number: 18267915846 live in beijing
  `;
    const userMessage: CoreMessage = {
      role: 'user',
      content: `Extract useful information from the content of this messages and generate an object based on the JSON schema:\n${content.trim()}`,
    };
    const [role, roleContent] = settingsForm.getValues(['role', 'content']);
    const systemMessage: CoreMessage = { role, content: roleContent };
    return [systemMessage, userMessage];
  }, [aiFormDescription]);

  const GenerateFormSchema = async () => {
    setLoading(true);
    const { partialObjectStream } = await streamObject({
      model,
      schema,
      messages,
    });
    for await (const partialObject of partialObjectStream) {
      setAiFormSchema(partialObject);
      console.log(partialObject);
    }
    setLoading(false);
  };

  linkRef.setFieldValue('password', '123');

  useEffect(() => {
    try {
      Object.entries(aiFormSchema).forEach(([key, value]) => {
        linkRef.setFieldValue(key, value);
        console.log(`Key: ${key}, Value: ${value}`);
      });
    } catch {
      console.error('parse error');
    }
  }, [aiFormSchema]);

  useEffect(() => {
    if (form) {
      setLinkRef(form);
    }
  }, [form]);

  return (
    <Form form={linkRef} {...rest}>
      <MagicInput
        value={aiFormDescription}
        onChange={setAiFormDescription}
        onLoading={messageLoading}
        onGenerate={() => {
          GenerateFormSchema();
        }}
      />
      {children as React.ReactNode}
    </Form>
  );
};

export default AIForm;
