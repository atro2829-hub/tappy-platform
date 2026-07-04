<?php

namespace App\Exceptions;

use RuntimeException;

/**
 * Thrown when a debit would push a wallet balance below zero.
 */
class InsufficientFundsException extends RuntimeException {}
