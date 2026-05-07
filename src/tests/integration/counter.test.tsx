import { test, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Counter } from "@/components/Counter/Counter";

test('check counter on click me button', () => {
    render(<Counter />);
    const button = screen.getByRole('button');
    const counter = screen.getByTestId('count')
    expect(button).toBeInTheDocument();
    expect(counter).toBeInTheDocument();
    expect(counter).toHaveTextContent("0");
    fireEvent.click(button);
    expect(counter).toHaveTextContent("1");
});
