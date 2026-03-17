/**
 * Frontend unit tests for reusable UI components.
 */

import { render, screen, fireEvent } from "@testing-library/react";
import { Button, Badge, Card, Input, EmptyState } from "@/components/ui";
import { Briefcase } from "lucide-react";

// ── Button ────────────────────────────────────────────────────────────────────

describe("Button", () => {
  it("renders with default props", () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole("button")).toBeInTheDocument();
    expect(screen.getByText("Click me")).toBeInTheDocument();
  });

  it("is disabled when loading", () => {
    render(<Button loading>Submit</Button>);
    expect(screen.getByRole("button")).toBeDisabled();
  });

  it("is disabled when disabled prop set", () => {
    render(<Button disabled>Submit</Button>);
    expect(screen.getByRole("button")).toBeDisabled();
  });

  it("calls onClick when clicked", () => {
    const onClick = jest.fn();
    render(<Button onClick={onClick}>Click</Button>);
    fireEvent.click(screen.getByRole("button"));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("does not call onClick when disabled", () => {
    const onClick = jest.fn();
    render(<Button disabled onClick={onClick}>Click</Button>);
    fireEvent.click(screen.getByRole("button"));
    expect(onClick).not.toHaveBeenCalled();
  });

  it("renders all variants without crashing", () => {
    const variants = ["primary", "secondary", "ghost", "danger", "success"] as const;
    variants.forEach((v) => {
      const { unmount } = render(<Button variant={v}>Button</Button>);
      expect(screen.getByText("Button")).toBeInTheDocument();
      unmount();
    });
  });
});

// ── Badge ─────────────────────────────────────────────────────────────────────

describe("Badge", () => {
  it("renders children", () => {
    render(<Badge>Active</Badge>);
    expect(screen.getByText("Active")).toBeInTheDocument();
  });

  it("renders dot when dot prop is true", () => {
    render(<Badge dot>Live</Badge>);
    const badge = screen.getByText("Live").closest("span");
    expect(badge?.querySelector("span")).toBeTruthy();
  });

  it("applies success variant class", () => {
    render(<Badge variant="success">Placed</Badge>);
    const el = screen.getByText("Placed");
    expect(el.className).toContain("emerald");
  });
});

// ── Card ──────────────────────────────────────────────────────────────────────

describe("Card", () => {
  it("renders children", () => {
    render(<Card><p>Card content</p></Card>);
    expect(screen.getByText("Card content")).toBeInTheDocument();
  });

  it("calls onClick when hoverable and clicked", () => {
    const onClick = jest.fn();
    render(<Card hoverable onClick={onClick}>Content</Card>);
    fireEvent.click(screen.getByText("Content").closest("div")!);
    expect(onClick).toHaveBeenCalled();
  });
});

// ── Input ─────────────────────────────────────────────────────────────────────

describe("Input", () => {
  it("renders label when provided", () => {
    render(<Input label="Email Address" placeholder="email@gmail.com" />);
    expect(screen.getByText("Email Address")).toBeInTheDocument();
  });

  it("shows error message", () => {
    render(<Input error="This field is required" />);
    expect(screen.getByText("This field is required")).toBeInTheDocument();
  });

  it("shows hint when no error", () => {
    render(<Input hint="Must be Gmail" />);
    expect(screen.getByText("Must be Gmail")).toBeInTheDocument();
  });

  it("accepts user input", () => {
    render(<Input placeholder="Type here" />);
    const input = screen.getByPlaceholderText("Type here");
    fireEvent.change(input, { target: { value: "hello" } });
    expect((input as HTMLInputElement).value).toBe("hello");
  });
});

// ── EmptyState ────────────────────────────────────────────────────────────────

describe("EmptyState", () => {
  it("renders title and description", () => {
    render(
      <EmptyState
        icon={Briefcase}
        title="No applications yet"
        description="Add your first application to get started"
      />
    );
    expect(screen.getByText("No applications yet")).toBeInTheDocument();
    expect(screen.getByText("Add your first application to get started")).toBeInTheDocument();
  });

  it("renders action when provided", () => {
    render(
      <EmptyState
        icon={Briefcase}
        title="Empty"
        action={<button>Add Item</button>}
      />
    );
    expect(screen.getByText("Add Item")).toBeInTheDocument();
  });
});
