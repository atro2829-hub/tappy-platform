<?php

namespace App\Exceptions;

use RuntimeException;

/**
 * Thrown when a transaction is asked to move to a status that is not a
 * legal next step from its current status.
 */
class InvalidTransactionStatusException extends RuntimeException {}
