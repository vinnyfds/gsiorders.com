import { render, screen } from '@testing-library/react';
import ChatWidget from '../src/components/ChatWidget';
import React from 'react';

describe('ChatWidget', () => {
  it('renders bot response with line breaks as <br>', () => {
    // Mock onClose
    const onClose = jest.fn();
    // Render ChatWidget
    render(<ChatWidget onClose={onClose} />);
    // The default welcome message should render with <br />
    const botMsg = screen.getByText(/How can I assist you today/);
    expect(botMsg).toBeInTheDocument();
    // Check that a <br> is present in the bot message container
    const botBubble = botMsg.closest('span');
    expect(botBubble?.innerHTML).toContain('<br');
  });

  it('matches snapshot of initial layout', () => {
    const onClose = jest.fn();
    const { container } = render(<ChatWidget onClose={onClose} />);
    expect(container).toMatchSnapshot();
  });
}); 