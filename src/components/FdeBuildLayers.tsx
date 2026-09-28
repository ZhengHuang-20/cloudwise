import React from 'react';
import { ArrowUp, Check, Repeat } from 'lucide-react';
import { FDE_LAYERS, FDE_LOOP } from '../data/fdeData';

// 层级示意自下而上逐层变宽：地基最宽
const LAYER_WIDTH: Record<number, string> = { 1: 'w-full', 2: 'w-4/5', 3: 'w-3/5' };

/** 服务页 FDE 子系统的三层建设图：左侧是层级示意与每周闭环，右侧逐层说明 */
export const FdeBuildLayers: React.FC<{ className?: string }> = ({ className = '' }) => (
  <section aria-labelledby="fde-layers-title" className={`border-t border-separator pt-10 ${className}`}>
    <h3 id="fde-layers-title" className="text-title-3">
      三层建设，自下而上
    </h3>
    <p className="mt-2 max-w-2xl text-body text-label-secondary">
      前一层是后一层的地基。每一层 FDE 都用 AI 提速，判断和拍板始终留在业务一线。
    </p>

    <div className="mt-8 grid gap-10 lg:grid-cols-[18rem_minmax(0,1fr)] lg:gap-14">
      <div className="self-start">
        <figure>
          <div
            role="img"
            aria-label="三层建设示意：自下而上依次为标准化、信息化、智能化"
            className="flex flex-col items-center gap-2"
          >
            {[...FDE_LAYERS].reverse().map((layer) => (
              <div
                key={layer.step}
                className={`${LAYER_WIDTH[layer.step]} rounded-control bg-surface-raised px-4 py-3 text-center`}
              >
                <span className="block text-caption text-label-secondary tabular-nums">第 {layer.step} 层</span>
                <span className="block text-title-3">{layer.name}</span>
              </div>
            ))}
          </div>
          <figcaption className="mt-4 flex items-center justify-center gap-2 text-caption text-label-secondary">
            <ArrowUp className="h-4 w-4" aria-hidden="true" />
            自下而上建设，顺序不能反
          </figcaption>
        </figure>

        <div className="mt-8 border-t border-separator pt-6">
          <h4 className="flex items-center gap-2 text-body font-semibold">
            <Repeat className="h-5 w-5 text-svc-fde" aria-hidden="true" />
            每周一轮闭环
          </h4>
          <ol className="mt-3 space-y-2">
            {FDE_LOOP.map((step, idx) => (
              <li key={step.name} className="flex gap-3 text-body">
                <span className="shrink-0 font-semibold tabular-nums">
                  {idx + 1}. {step.name}
                </span>
                <span className="text-label-secondary">{step.desc}</span>
              </li>
            ))}
          </ol>
          <p className="mt-3 text-caption text-label-secondary">一个场景走完一轮，三层各往前一步。</p>
        </div>
      </div>

      <ol className="divide-y divide-separator">
        {FDE_LAYERS.map((layer) => (
          <li key={layer.step} className="py-7 first:pt-0 last:pb-0">
            <p className="text-caption text-label-secondary tabular-nums">第 {layer.step} 层</p>
            <h4 className="mt-1 text-title-3">
              {layer.name}：{layer.motto}
            </h4>
            <p className="mt-2 text-body text-label-secondary">{layer.pain}</p>
            <div className="mt-5 grid gap-5 sm:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] sm:gap-8">
              <div>
                <p className="text-caption text-label-secondary">FDE 怎样用 AI</p>
                <p className="mt-1 text-body">{layer.aiWork}</p>
              </div>
              <div>
                <p className="text-caption text-label-secondary">留给企业</p>
                <ul className="mt-1 space-y-1">
                  {layer.outputs.map((output) => (
                    <li key={output} className="flex gap-2 text-body">
                      <Check className="mt-1 h-4 w-4 shrink-0 text-success" aria-hidden="true" />
                      <span>{output}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </li>
        ))}
      </ol>
    </div>
  </section>
);
