import { describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import StaticTable from '@/components/StaticTable.vue';

const mountTable = (content: Record<string, unknown[]>, maximum = 4) =>
  mount(StaticTable, {
    props: { title: 'Deliveries', content, tableColor: '#ED7D3A', maximum },
  });

const countNbsp = (html: string) => html.match(/&nbsp;/g) ?? [];

describe('StaticTable', () => {
  it('renders the title and column headers', () => {
    const wrapper = mountTable({ Status: ['Delivered'], Date: ['Jan 1'] });

    expect(wrapper.text()).toContain('Deliveries');
    expect(wrapper.text()).toContain('Status');
    expect(wrapper.text()).toContain('Date');
  });

  it('renders row values across columns', () => {
    const wrapper = mountTable({
      'Stock Name': ['Paracetamol'],
      'Stock Amount': [5],
    });

    expect(wrapper.text()).toContain('Paracetamol');
    expect(wrapper.text()).toContain('5');
  });

  it('renders status images for Delivered and Pending first-column values', () => {
    const wrapper = mountTable({ Status: ['Delivered', 'Pending'] }, 2);

    const images = wrapper.findAll('img');
    expect(images).toHaveLength(2);
  });

  it('pads with filler cells up to the maximum row count', () => {
    const wrapper = mountTable({ 'Stock Name': ['Only'] }, 3);

    // Filler cells render `&nbsp;`; DOMWrapper.text() trims whitespace (which
    // strips the non-breaking space), so count them in the raw HTML instead.
    expect(wrapper.text()).toContain('Only');
    expect(countNbsp(wrapper.html()).length).toBeGreaterThanOrEqual(2);
  });

  it('renders no filler rows when content reaches the maximum', () => {
    const wrapper = mountTable({ 'Stock Name': ['A', 'B'] }, 2);

    expect(countNbsp(wrapper.html())).toHaveLength(0);
  });
});
