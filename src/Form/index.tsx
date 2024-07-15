import React, { useEffect, useState, type FC } from 'react';

import { generateObject } from 'ai';
import { Button, Form, FormProps } from 'antd';
import { chromeai } from 'chrome-ai';
import { z } from 'zod';

type AIFormProps = {
  description?: string;
} & FormProps;

const AIForm: FC<AIFormProps> = (props) => {
  const { form, children, ...rest } = props;

  const GenerateFormSchema = async () => {
    const res = await generateObject({
      // @ts-ignore-next-line
      model: chromeai(),
      schema: z.object({
        recipe: z.object({
          name: z.string(),
          ingredients: z.array(
            z.object({
              name: z.string(),
              amount: z.string(),
            }),
          ),
          steps: z.array(z.string()),
        }),
      }),
      prompt: 'Generate a lasagna recipe.',
    });
    return res;
  };

  const [linkRef, setLinkRef] = useState(form);
  const [aiFormSchema, setAiFormSchema] = useState<any>({});

  useEffect(() => {
    if (form) {
      setLinkRef(form);
    }
  }, [form]);

  return (
    <Form form={form} {...rest}>
      {aiFormSchema.toString()}
      <Button
        onClick={async () => {
          console.log('GenerateFormSchema', await GenerateFormSchema());
        }}
      ></Button>
      {children as React.ReactNode}
    </Form>
  );

  const { description } = props;

  return <div>{description}</div>;
};

export default AIForm;
