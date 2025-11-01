import { Component, type ReactNode } from 'react';

interface ChunkErrorBoundaryProps {
  children: ReactNode;
}

interface ChunkErrorBoundaryState {
  hasError: boolean;
}

const isChunkLoadError = (error: unknown): boolean => {
  if (!error || typeof error !== 'object') return false;
  const message = (error as { message?: string }).message ?? '';
  return (
    message.includes('Loading chunk') ||
    message.includes('ChunkLoadError') ||
    message.includes('Failed to fetch dynamically imported module')
  );
};

export class ChunkErrorBoundary extends Component<
  ChunkErrorBoundaryProps,
  ChunkErrorBoundaryState
> {
  state: ChunkErrorBoundaryState = {
    hasError: false,
  };

  static getDerivedStateFromError(): ChunkErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: unknown) {
    if (!isChunkLoadError(error)) {
      console.error('Unhandled render error:', error);
    }
  }

  render() {
    if (this.state.hasError) {
      const url = `${window.location.origin}${window.location.pathname}?nocache=${Date.now()}`;
      return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
          <div className="max-w-md rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
            <h1 className="text-xl font-semibold text-gray-900">페이지를 다시 불러올 수 없었어요</h1>
            <p className="mt-3 text-sm text-gray-600">
              새 버전이 배포되는 중 페이지 조각을 불러오지 못했습니다. 아래 버튼을 눌러 새로고침해 주세요.
            </p>
            <button
              type="button"
              onClick={() => {
                window.location.href = url;
              }}
              className="mt-6 inline-flex items-center justify-center rounded-lg bg-blue-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              새로고침
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ChunkErrorBoundary;
