import { zodResolver } from '@hookform/resolvers/zod';
import { chromeai } from 'chrome-ai';
import React from 'react';
import { UseFormReturn, useForm } from 'react-hook-form';
import { z } from 'zod';

const formSchema = z.object({
  model: z.enum(['text']),
  temperature: z.number().min(0).max(1),
  topK: z.number().min(1),
  role: z.enum(['system', 'user', 'assistant']),
  content: z.string(),
});

export interface SettingsProps extends React.HTMLAttributes<HTMLDivElement> {
  initialValue?: Partial<z.infer<typeof formSchema>>;
  form: UseFormReturn<z.infer<typeof formSchema>>;
}

export const useSettingsForm = (
  initialValue?: Partial<z.infer<typeof formSchema>>,
) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: Object.assign(
      {
        model: 'text',
        temperature: 0.8,
        topK: 3,
        role: 'system',
        content: 'You are a helpful assistant.',
      },
      initialValue,
    ),
  });
  return form;
};

export const useSettingsModel = (
  form: UseFormReturn<z.infer<typeof formSchema>>,
) => {
  const [model, temperature, topK] = form.watch([
    'model',
    'temperature',
    'topK',
  ]);

  const ai = React.useMemo(
    () =>
      chromeai(model, {
        temperature: temperature,
        topK: topK,
      }),
    [model, temperature, topK],
  );
  return ai;
};
