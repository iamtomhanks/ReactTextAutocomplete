import { useEffect, useRef, useState } from 'react';
import styles from './styles.module.scss';

const formatTextInput = (string: string) => {
	return string
		.toLowerCase()
		.replace(/&nbsp;/g, '')
		.replace(/&amp;/g, '&')
		.replace(/&gt;/g, '>')
		.replace(/&lt;/g, '<');
};

interface IProps {
	phrases: string[];
	inputValue?: string;
	placeholder?: string;
	onPressEnter?: () => void;
}

const ReactTextAutoComplete = ({
	phrases,
	inputValue,
	placeholder,
	onPressEnter,
}: IProps) => {
	const inputRef = useRef<HTMLDivElement | null>(null);

	const [message, setMessage] = useState(inputValue ?? '');
	const [showPlaceholder, setShowPlaceholder] = useState(true);

	const [autoComplete, setAutoComplete] = useState<{
		wholePrompt: string;
		trailingText: string;
		startIdx: number;
	} | null>(null);

	useEffect(() => {
		if (inputValue) {
			setMessage(inputValue);
			setInputContents(inputValue);
			setShowPlaceholder(false);
			setCursorPosition(inputValue.length);
		}
	}, [inputValue]);

	const setInputContents = (contents: string) => {
		if (inputRef.current) {
			inputRef.current.innerHTML = contents;
		}
	};

	const getInputContents = () => {
		if (inputRef.current) {
			return inputRef.current.childNodes[0]?.textContent ?? '';
		}

		return '';
	};

	const setCursorPosition = (position: number) => {
		if (inputRef.current && inputRef.current.childNodes[0]) {
			const selectedText = window.getSelection();
			const selectedRange = document.createRange();
			selectedRange.setStart(inputRef.current.childNodes[0], position);
			selectedRange.collapse(true);
			selectedText?.removeAllRanges();
			selectedText?.addRange(selectedRange);
		}
	};

	return (
		<div className={styles['container']}>
			<div
				ref={inputRef}
				className={styles.input}
				contentEditable
				onInput={(e) => {
					const inputVal = e.currentTarget.childNodes[0]?.textContent;

					if (inputVal && inputVal.length) {
						setShowPlaceholder(false);

						let tempAutoCompleteText: string | null = null;
						let wholePrompt = '';

						if (inputVal.length > 1) {
							for (const autoCompletePrompt of phrases) {
								if (
									formatTextInput(autoCompletePrompt).indexOf(
										formatTextInput(inputVal)
									) === 0
								) {
									tempAutoCompleteText = autoCompletePrompt.slice(
										inputVal.length
									);
									wholePrompt = autoCompletePrompt;
								}
							}
						}

						if (inputRef.current) {
							setInputContents(
								`${inputVal}<span class="auto-complete-text" style="color: #8f8f8f;" contenteditable="false">${
									tempAutoCompleteText ?? ''
								}</span>`
							);
						}

						setCursorPosition(inputVal.length);

						setAutoComplete(
							tempAutoCompleteText
								? {
										trailingText: tempAutoCompleteText,
										startIdx: message.length,
										wholePrompt,
								  }
								: null
						);
						setMessage(inputVal);
					} else {
						setMessage('');
						setShowPlaceholder(true);
					}
				}}
				onKeyDown={(e) => {
					if (e.key === 'Tab' && autoComplete) {
						e.preventDefault();
						setInputContents(autoComplete.wholePrompt);
						setMessage(autoComplete.wholePrompt);
						setAutoComplete(null);
						setCursorPosition(autoComplete.wholePrompt.length);
					} else if (e.key === 'Enter') {
						if (onPressEnter) {
							e.preventDefault();
							setInputContents('');
							setAutoComplete(null);
							setShowPlaceholder(true);
							setMessage('');
							onPressEnter();
						}
					}
				}}
			/>
			{showPlaceholder && placeholder && (
				<span
					onClick={() => inputRef.current?.focus()}
					className={styles.placeholder}
				>
					{placeholder}
				</span>
			)}
		</div>
	);
};

export { ReactTextAutoComplete };
